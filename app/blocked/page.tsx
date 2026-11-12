import { config } from "@/lib/config";

export default function Blocked() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">{config.appName} is only available in India</h1>
      <p className="mt-3 max-w-sm text-mist/70">
        We couldn't confirm that you're in India. If you're travelling or on a VPN, turn it off and reload.
      </p>
    </main>
  );
}
