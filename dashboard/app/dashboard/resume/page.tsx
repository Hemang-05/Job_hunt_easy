import { currentUser } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'
import { FileText, Upload, CheckCircle } from 'lucide-react'

export default async function ResumePage() {
  const user = await currentUser()
  let resumeName: string | null = null

  try {
    const { client: supabase } = await createUserClient()
    const { data } = await supabase
      .from('resumes')
      .select('file_name')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (data) resumeName = data.file_name
  } catch (err) {
    console.error('[Dashboard] Error fetching resume:', err)
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resume</h1>
        <p className="text-gray-550 mt-2 text-sm font-medium">
          Your resume is processed locally in the extension and never stored on our servers.
        </p>
      </div>

      {resumeName ? (
        /* ── Resume Uploaded State ── */
        <div className="glass-tile p-10 bg-white">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-[20px] flex items-center justify-center border border-emerald-200/60 shadow-sm">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">
                Resume Active
              </div>
              <div className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                {resumeName}
              </div>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                To update your resume, open the Job Hunt Easy extension popup and upload a new PDF.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ── No Resume State ── */
        <div className="glass-tile p-14 text-center bg-white">
          <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-[28px] flex items-center justify-center mx-auto mb-8">
            <Upload className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">No resume uploaded yet</h2>
          <p className="text-gray-500 max-w-md mx-auto font-medium leading-relaxed mb-10">
            Upload your resume through the extension popup. It stays on your device — we never store it.
          </p>

          <div className="bg-gray-50 rounded-3xl p-8 max-w-md mx-auto text-left border border-gray-200">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6">
              How to upload your resume
            </h3>
            <ol className="space-y-5 text-gray-600 text-sm font-medium">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-xs">1</span>
                <span>Click the <b className="text-gray-900">Job Hunt Easy</b> icon in your browser toolbar.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-xs">2</span>
                <span>Click <b className="text-gray-900">Upload Resume</b> and select your PDF file.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-xs">3</span>
                <span>That&apos;s it! The AI reads your resume and you&apos;re ready to autofill.</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
