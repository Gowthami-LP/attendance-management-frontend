export default function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <p className="loading" role="status">
      {message}
    </p>
  );
}
