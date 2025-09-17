"use client"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-semibold">Application error</h2>
            <p className="text-sm text-muted-foreground">{error.message || "Unexpected error occurred."}</p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


