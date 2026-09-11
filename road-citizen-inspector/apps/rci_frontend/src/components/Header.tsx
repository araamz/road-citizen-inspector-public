import { Link } from '@tanstack/react-router'
import logoUrl from '../logo.png'
import QuickAccess from './Widgets/QuickAccess/QuickAccess'
import CurrentSession from './Widgets/CurrentSession/CurrentSession'
import ShareSession from './Widgets/ShareSession/ShareSession'

export default function () {

  return (
    <header className="top-0 z-50 py-4 flex items-center justify-between px-10 bg-white border-b border-neutral-300 lg:flex-col lg:px-5 lg:border-b-0 lg:border-r">
      <div className="flex flex-row gap-4 items-center lg:flex-col">
        <QuickAccess />
        <CurrentSession />
        <ShareSession />
      </div>
      <div>
        <Link to="/" className='cursor-pointer'>
          <img src={logoUrl} className="w-11" />
        </Link>
      </div>
    </header>
  )
}
