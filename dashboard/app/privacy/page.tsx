import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 text-slate-200">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <nav className="flex items-center justify-between px-8 py-5 max-w-4xl mx-auto border-b border-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold tracking-tight">
            J
          </div>
          <span className="font-semibold text-white tracking-tight text-xl">Job Hunt Easy</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed font-light">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p>
              Job Hunt Easy operates as an AI-powered browser extension and dashboard. When you use our service, we collect:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Resume Data:</strong> The PDF or text you upload to parse your background and experience.</li>
              <li><strong>Account Information:</strong> If you sign up for an account, we use Clerk to manage your secure authentication.</li>
              <li><strong>Form Context:</strong> When you use the extension, we momentarily read the specific questions on the web form you are actively viewing in order to generate an answer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Data</h2>
            <p>
              Your data is used strictly for the core functionality of the product—to autofill your job applications.
              <strong> We do not sell your personal data or resume information to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Third-Party AI Models</h2>
            <p>
              To generate answers, the text of the job application questions and the relevant context from your resume are securely transmitted to top-tier AI providers via our backend proxy (OpenRouter, Google Gemini, Anthropic, or OpenAI). These third parties process the data purely to fulfill the prompt request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Browser Permissions</h2>
            <p>Our Chrome Extension requests the following permissions for specific reasons:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>activeTab & scripting:</strong> To inject our autofill scripts into the job application form you are currently looking at.</li>
              <li><strong>storage:</strong> To save your preferences and resume context locally so the extension functions quickly.</li>
              <li><strong>host_permissions:</strong> To seamlessly communicate with your secure backend dashboard and AI APIs across websites.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Controls</h2>
            <p>
              You can delete your resume from the dashboard at any time. You can also uninstall the Chrome Extension. Deleting your data from the dashboard permanently erases it from our Supabase database.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
