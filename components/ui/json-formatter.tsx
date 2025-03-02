import { parseJSONContent } from "@/lib/utils";


export const JSONFormatter = ({
  content,
  parsed // Optional pre-parsed content
}: {
  content: string;
  parsed?: any;
}) => {
  const data = parsed || parseJSONContent(content);

  if (typeof data === 'string') {
    return (
      <span className="font-mono text-sm break-words">{data}</span>
    );
  }

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm dark:text-gray-200">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
};