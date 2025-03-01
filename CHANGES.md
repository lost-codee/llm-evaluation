# LLM Monitor Changes

## Project Overview
LLM Monitor is a NextJS application that serves as a playground for testing and monitoring LLM (Large Language Model) prompts. The app allows users to test prompts across different LLM models while tracking token consumption, execution time, and associated costs.

## Project Structure

### Core Technologies
- Next.js 13+ with App Router
- Prisma with PostgreSQL database
- Shadcn UI for component library
- Redux for state management
- Recharts for data visualization
- Token.js for LLM calls
- OpenAI API for openAI api calls

### Directory Structure

```
llm-llm-evals/
├── app/
│   ├── actions/
│   │   ├── llm.ts                 # LLM-related server actions
│   │   ├── function-calls.ts      # Function call management
│   │   ├── benchmark.ts           # Benchmarking functionality
│   │   ├── datasets.ts            # Dataset management
│   │   ├── export.ts              # Export functionality
│   │   ├── history.ts             # History tracking
│   │   ├── models.ts              # Model management
│   │   ├── providers.ts           # Provider management
│   │   └── prompts.ts             # Prompt testing
│   ├── api/
│   │   ├── llm/
│   │   │   └── structured/        # Structured output API
│   │   ├── benchmark/             # Benchmarking API
│   │   ├── datasets/              # Datasets API
│   │   ├── files/                 # File management API
│   │   ├── history/              # History API
│   │   └── providers/            # Providers API
│   ├── benchmark/                # Benchmarking interface
│   ├── datasets/                 # Dataset management
│   ├── logs/                    # Usage logs and history
│   ├── prompts/                 # Prompt testing
│   └── settings/                # Application settings
├── components/
│   ├── parameters/              # Parameter management
│   ├── dashboard/              
│   │   └── usage-chart.tsx      # Usage analytics
│   ├── datasets/
│   │   ├── create-dataset-dialog.tsx
│   │   ├── dataset-picker.tsx
│   │   ├── dataset-preview-dialog.tsx
│   │   └── datasets-table.tsx
│   ├── logs/
│   │   ├── export-logs-button.tsx
│   │   └── view-log-button.tsx
│   ├── settings/
│   │   ├── create-provider-dialog.tsx
│   │   ├── delete-provider-button.tsx
│   │   └── providers-table.tsx
│   └── ui/                      # Shadcn UI components
├── lib/
│   ├── db.ts                    # Prisma database client
│   ├── utils.ts                 # Utility functions
│   └── constants.ts             # Application constants
├── types/
│   └── index.ts                 # TypeScript type definitions
└── prisma/
    └── schema.prisma            # Database schema
```

### Key Features

#### 1. Prompt Testing
- Users can write and test prompts in the code editor
- Support for multiple LLM providers and models
- Real-time token counting and cost estimation
- System prompt support

#### 2. Function Calling
- Structured output generation using OpenAI's function calling
- Visual function builder interface
- Function definitions are saved per file
- Parameters include:
  - Name
  - Description
  - Type (string, integer, number, boolean, array, object)
  - Required flag
  - Enum values support

#### 3. Benchmarking
- Compare performance across different models
- Dataset-based benchmarking
- Performance metrics visualization
- Export benchmark results

#### 4. Dataset Management
- Create and manage prompt datasets
- Dataset preview functionality
- Use datasets for batch testing
- Dataset-based benchmarking

#### 5. Usage Tracking
- Comprehensive logging system
- Export logs functionality
- Usage analytics and charts
- Cost tracking per request

#### 6. Provider Management
- Multiple provider support
- Custom endpoint configuration
- API key management
- Model availability tracking
- Last used timestamp tracking

#### 7. Database Schema
```prisma
model Provider {
  id        String    @id @default(uuid())
  name      String
  source    String
  token     String
  endpoint  String?
  models    String[]  @default([])
  lastUsed  DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model File {
  id            String         @id @default(uuid())
  name          String
  path          String
  content       String?
  type          String
  parentId      String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  parent        File?          @relation("FileToFile", fields: [parentId], references: [id])
  children      File[]         @relation("FileToFile")
  functionCalls FunctionCall[] @relation("FunctionCallToFile")
}

model Dataset {
  id        String   @id @default(uuid())
  name      String
  data      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model History {
  id           String   @id @default(uuid())
  prompt       String
  systemPrompt String?
  parameters   String?
  response     String
  model        String
  duration     String
  usage        String?
  createdAt    DateTime @default(now())
}

model FunctionCall {
  id          String   @id @default(uuid())
  name        String
  description String
  parameters  Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  file        File?    @relation("FunctionCallToFile", fields: [fileId], references: [id])
  fileId      String?
}
```

### API Structure

#### Function Calls API
- `GET /api/files/[id]/function-calls`: Get all function calls for a file
- `POST /api/files/[id]/function-calls`: Create new function calls
- `DELETE /api/files/[id]/function-calls`: Delete function calls

#### LLM API
- `POST /api/llm/structured`: Handle structured output requests with function calling
- `POST /api/llm`: Handle standard LLM requests

#### Benchmark API
- `POST /api/benchmark`: Run benchmarks across models

#### Dataset API
- `GET /api/datasets`: List all datasets
- `POST /api/datasets`: Create new dataset
- `DELETE /api/datasets`: Delete dataset

#### History API
- `GET /api/history`: Get usage history
- `POST /api/history`: Log new request

#### Provider API
- `GET /api/providers`: List all providers
- `POST /api/providers`: Add new provider
- `DELETE /api/providers`: Remove provider

### Recent Updates

### Benchmark Page Improvements (2025-02-06)

#### UI/UX Enhancements
- Improved table layout for better readability
- Added a summary table showing model performance metrics
- Reorganized the detailed results table to show model responses side by side
- Simplified provider/model selection with checkboxes for easier multi-model selection

#### Prompt Template System
- Added support for prompt templates in benchmarking
- Users can now select a prompt file to use as a template
- Template system supports variable substitution using {{variable}} syntax
- Dataset values are automatically inserted into prompt templates
- Separated prompt template from dataset for better reusability

#### Function Call Integration
- Added support for function calling in benchmarks
- Automatically detects and loads function calls associated with prompt files
- Handles both regular text completions and structured function call responses
- Routes function call requests to dedicated structured endpoint
- Formats function call responses consistently for comparison with expected outputs

#### Configuration Panel
- Added prompt file selector in the configuration panel
- Configuration and results are now visible simultaneously
- Improved layout organization with clear section headers
- Better validation and error handling for required fields

### Function Call Support 
- Added function calling support with visual builder
- Implemented function call persistence in database
- Added function call history tracking
- Improved error handling for function calls

### Token Usage and Cost Tracking 
- Added token usage and cost tracking
- Integrated with OpenAI's function calling API

### Benchmarking Functionality 
- Added benchmarking functionality
- Added dataset management
- Enhanced logging and analytics
- Added provider management interface
