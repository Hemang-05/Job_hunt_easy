import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { SEOArticleLayout } from '@/components/SEOArticleLayout'

export const metadata: Metadata = {
  title: 'Job Hunt Strategies & Resources | Job Hunt Easy',
  description: 'Read our latest guides on automating your job hunt, writing better resumes, and landing more interviews using AI.',
}

const articles = [
  {
    title: 'How to Land Remote React Jobs 5x Faster',
    description: 'The market for remote React jobs is highly competitive. Learn how to automate your applications on Workday, Greenhouse, and Lever to secure more interviews.',
    href: '/remote-react-jobs',
    tag: 'Frontend',
  },
  {
    title: 'Apply to Frontend Jobs in Germany 5x Faster',
    description: 'The German tech market is booming. Learn how to navigate European ATS systems and automate your applications for Developer roles in Berlin and Munich.',
    href: '/frontend-jobs-germany',
    tag: 'Relocation',
  },
  {
    title: 'How to Secure Jobs with Visa Sponsorship',
    description: 'Finding companies that offer visa sponsorship requires applying to hundreds of roles. Automate your job applications to increase your chances of relocating.',
    href: '/jobs-with-visa-sponsorship',
    tag: 'International',
  },
  {
    title: 'The Ultimate Gmail Job Application Organizer',
    description: 'Stop losing track of your job applications in your inbox. Learn how to organize your Gmail and use AI to track your job hunt.',
    href: '/gmail-job-application-organizer',
    tag: 'Productivity',
  },
  {
    title: 'How to Land Full Stack Engineer Jobs',
    description: 'Full stack engineers have to list dozens of technologies on every application. Automate your job applications on Workday and Greenhouse to save hours.',
    href: '/full-stack-engineer-jobs',
    tag: 'Engineering',
  },
]

export default function BlogIndexPage() {
  return (
    <SEOArticleLayout 
      title="Job Hunt Strategies & Resources"
      subtitle="Master the art of the modern job hunt. Learn how to leverage automation, optimize your workflow, and land your dream role faster."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 mb-24 -mx-4 sm:mx-0">
        {articles.map((article, i) => (
          <Link 
            key={i} 
            href={article.href}
            className="group relative flex flex-col p-6 sm:p-8 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-500/10 hover:border-indigo-500/30 rounded-3xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">{article.tag}</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white mb-3 tracking-tight !mt-0 pr-12">
              {article.title}
            </h3>
            
            <p className="text-white/60 font-medium text-sm sm:text-base leading-relaxed flex-grow !mb-0">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </SEOArticleLayout>
  )
}
