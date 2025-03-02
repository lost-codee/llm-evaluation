import { parseJSONContent } from '@/lib/utils';
import { diffWords } from 'diff';


export const DiffFormatter = ({ expected, actual }: {
  expected: string;
  actual: string;
}) => {
  try {
    const expectedData = parseJSONContent(expected);
    const actualData = parseJSONContent(actual);

    // Check if both are valid JSON
    const isExpectedJSON = typeof expectedData === 'object' && expectedData !== null;
    const isActualJSON = typeof actualData === 'object' && actualData !== null;

    if (isExpectedJSON && isActualJSON) {
      const diff = diffWords(
        JSON.stringify(expectedData, null, 2),
        JSON.stringify(actualData, null, 2)
      );

      return (
        <pre className="font-mono text-sm p-2 rounded bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap overflow-x-auto">
          {diff.map((part, index) => (
            <span
              key={index}
              className={
                part.added ? 'bg-green-100 dark:bg-green-900/50' :
                  part.removed ? 'bg-red-100 dark:bg-red-900/50 line-through' : ''
              }
            >
              {part.value}
            </span>
          ))}
        </pre>
      );
    }

    // If not both JSON, do a regular text diff
    const diff = diffWords(expected, actual);
    return (
      <pre className="font-mono text-sm p-2 rounded bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap overflow-x-auto">
        {diff.map((part, index) => (
          <span
            key={index}
            className={
              part.added ? 'bg-green-100 dark:bg-green-900/50' :
                part.removed ? 'bg-red-100 dark:bg-red-900/50 line-through' : ''
            }
          >
            {part.value}
          </span>
        ))}
      </pre>
    );
  } catch (error) {
    // Fallback to showing raw text if diff fails
    return (
      <div className="space-y-2">
        <pre className="font-mono text-sm p-2 rounded bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap overflow-x-auto">
          <div className="text-red-500">Expected:</div>
          {expected}
        </pre>
        <pre className="font-mono text-sm p-2 rounded bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap overflow-x-auto">
          <div className="text-green-500">Actual:</div>
          {actual}
        </pre>
      </div>
    );
  }
};