'use server';

import { db } from '@/lib/db';
import { Provider } from '@/types';
import { getUser } from './auth';
import {
  handleError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  validateRequired,
} from '../../lib/errors';
import { ProviderFormData } from '@/components/settings/create-provider-dialog';

export async function getProviders(): Promise<Provider[] | undefined> {
  try {
    const user = await getUser();
    if (!user) {
      throw new AuthenticationError();
    }

    const providers = await db.provider.findMany({
      where: {
        userId: user.id,
      },
    });
    return providers as Provider[];
  } catch (error) {
    handleError(error);
  }
}

export async function createProvider(
  data: ProviderFormData
): Promise<Provider | undefined> {
  try {
    const user = await getUser();
    if (!user) {
      throw new AuthenticationError();
    }

    // Validate required fields
    validateProviderData(data);

    const provider = await db.provider.create({
      data: {
        userId: user.id,
        name: data.name,
        source: data.source,
        token: data.token ?? '',
        endpoint: data.endpoint,
        models: data.models,
      },
    });
    return provider as Provider;
  } catch (error) {
    handleError(error);
  }
}

export async function updateProvider(
  id: string,
  data: Partial<ProviderFormData>
): Promise<Provider | undefined> {
  try {
    const user = await getUser();
    if (!user) {
      throw new AuthenticationError();
    }

    // Check if provider exists and belongs to user
    const existingProvider = await db.provider.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProvider) {
      throw new NotFoundError('Provider');
    }

    // Validate data if updating critical fields
    if (data.source || data.name) {
      validateProviderData({
        ...existingProvider,
        ...data,
      } as ProviderFormData);
    }

    const provider = await db.provider.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        name: data.name,
        source: data.source,
        token: data.token ?? undefined,
        endpoint: data.endpoint ?? undefined,
        models: data.models ?? undefined,
      },
    });
    return provider as Provider;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteProvider(id: string): Promise<void | undefined> {
  try {
    const user = await getUser();
    if (!user) {
      throw new AuthenticationError();
    }

    // Check if provider exists and belongs to user
    const existingProvider = await db.provider.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProvider) {
      throw new NotFoundError('Provider');
    }

    // Delete related records in a transaction
    await db.$transaction([
      db.logs.deleteMany({
        where: {
          providerId: id,
        },
      }),
      db.provider.delete({
        where: {
          id,
          userId: user.id,
        },
      }),
    ]);
  } catch (error) {
    handleError(error);
  }
}

export async function getProviderModels(
  providerId: string
): Promise<string[] | undefined> {
  try {
    const user = await getUser();
    if (!user) {
      throw new AuthenticationError();
    }

    const provider = await db.provider.findUnique({
      where: {
        id: providerId,
        userId: user.id,
      },
      select: { models: true },
    });

    if (!provider) {
      throw new NotFoundError('Provider');
    }

    return provider.models;
  } catch (error) {
    handleError(error);
  }
}

function validateProviderData(data: Partial<ProviderFormData>) {
  // Check required fields
  validateRequired(data, ['name', 'source', 'models']);

  if (!data.name?.trim()) {
    throw new ValidationError('Provider name cannot be empty');
  }

  if (!data.models || data.models.length === 0) {
    throw new ValidationError('At least one model must be specified');
  }

  // Validate source-specific requirements
  if (data.source === 'openai' && !data.token) {
    throw new ValidationError('API token is required for OpenAI provider');
  }
  if (data.source === 'custom' && !data.endpoint) {
    throw new ValidationError('Endpoint URL is required for custom provider');
  }
}
