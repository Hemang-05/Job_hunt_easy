import { currentUser } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'

export default async function ResumePage() {
  const user = await currentUser()
  let resume = null

  try {
    const supabase = await createUserClient()
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (data) resume = data
  } catch (err) {
    console.error('[Dashboard] Error fetching resume:', err)
  }

  if (!resume) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Resume</h1>
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No resume uploaded</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Fillr works by reading your resume. Upload your PDF directly in the Fillr Chrome Extension.
          </p>
          <div className="inline-block bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-lg">
            Open the Chrome Extension popup to upload →
          </div>
        </div>
      </div>
    )
  }

  // Group chunks by type
  const chunksByType = (resume.chunks || []).reduce((acc: Record<string, any[]>, chunk: any) => {
    const t = chunk.type || 'other'
    if (!acc[t]) acc[t] = []
    acc[t].push(chunk)
    return acc
  }, {})

  const chunkTypes = ['summary', 'experience', 'education', 'skills', 'projects', 'other']

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Resume</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is the data Fillr uses to answer questions on your behalf.
          </p>
        </div>
        <div className="group relative inline-block">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Update Resume
          </button>
          {/* Tooltip on hover saying to use the extension */}
          <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
            Open the Fillr Chrome extension popup in your browser toolbar to upload a new PDF.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-500">File Name</div>
          <div className="text-lg font-semibold text-gray-900 mt-1 truncate" title={resume.file_name}>
            {resume.file_name}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Version</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">v{resume.version}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Size</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">{resume.size_kb} KB</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Parsed Chunks</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">
            {resume.chunks?.length || 0}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Parsed Semantic Data</h2>
        <div className="space-y-4">
          {chunkTypes.map((type) => {
            const chunks = chunksByType[type]
            if (!chunks || chunks.length === 0) return null

            return (
              <details key={type} className="bg-white rounded-xl border border-gray-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden flex flex-col group">
                <summary className="cursor-pointer bg-gray-50 px-5 py-4 font-semibold text-gray-900 flex items-center justify-between select-none">
                  <div className="flex items-center gap-3">
                    <span className="capitalize">{type}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {chunks.length} chunks
                    </span>
                  </div>
                  <span className="text-gray-400 group-open:rotate-180 transform transition-transform duration-200">
                    ▼
                  </span>
                </summary>
                
                <div className="p-5 border-t border-gray-100 space-y-4 bg-white">
                  {chunks.map((chunk, idx) => (
                    <div key={chunk.id || idx} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {chunk.content}
                      </div>
                      {chunk.keywords && chunk.keywords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {chunk.keywords.map((kw: string, i: number) => (
                            <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </div>
  )
}
