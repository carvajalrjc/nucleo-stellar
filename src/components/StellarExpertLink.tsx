function StellarExpertLink({ url }: { url: string }) {
  return (
    <div className="flex justify-center mt-8">
      <a
        href={`https://stellar.expert/explorer/testnet/tx/${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View on explorer
      </a>
    </div>
  );
}

export default StellarExpertLink;
