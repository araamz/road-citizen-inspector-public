import { useQuery } from '@tanstack/react-query'
import stepOne from '../tts_heros/step1.png'
import stepTwo from '../tts_heros/step2.png'
import stepThree from '../tts_heros/step3.png'
import stepFour from '../tts_heros/step4.png'
import SectionLabel from './SectionLabel'
import Container from './Container'
import Note from './Note'
import type { NoteProps } from './Note'
import type { ReactElement } from 'react'
import useLatestWebhookKeyOptions from '@/hooks/queries/webhook_key/UseLatestWebhookKeyOptions'

type DirectionStep = {
  title: string
  image: string
  description: ReactElement<HTMLParagraphElement>
  note?: Array<NoteProps> | NoteProps
}
export default function SessionClaimDirections() {
  const { data } = useQuery(useLatestWebhookKeyOptions())

  const directionSteps: Array<DirectionStep> = [
    {
      title: 'Access your Things Stack Application',
      image: stepOne,
      description: (
        <p>
          Using The Things Stack console, open the dashboard for the application you want to integrate with Road Citizen Inspector.
        </p>
      ),
      note: {
        type: 'attention',
        children: (
          <p>
            Vist the Things Stack documentation{' '}
            <a className='underline decoration-1 underline-offset-1' href="https://www.thethingsindustries.com/docs/integrations/adding-applications/">
              here
            </a>{' '}
            to learn how to start an application. Once you have an application, you can proceed to the next step.
          </p>
        ),
      },
    },
    {
      title: 'Select Webhooks in your Application',
      image: stepTwo,
      description: (
        <p>
          In your application’s sidebar, navigate to <span className='font-semibold'>Webhooks.</span> From the Webhooks page, click <span className="font-semibold">"Add webhook"</span> to create a new integration. 
        </p>
      ),
    },
    {
      title: 'Search for the "Road Citizen Inspector"',
      image: stepThree,
      description: (
        <p>
          In the webhook template list, search for <span className='font-semibold'>"Road Citizen Inspector."</span> Select the template to automatically load the required configuration settings.
        </p>
      ),
    },
    {
      title: 'Share!',
      image: stepFour,
      description: (
        <p>
          Give the RCI webhook a memorable name in your Things Stack. Your Webhook Key is <span className='font-mono text-sm px-1 py-0.5 bg-amber-100 border-1 border-amber-300 rounded-lg'>{data?.hashed_key}</span>. Enter the
          generated webhook key into the "Webhook Key" field. Once complete, click <span className='font-semibold'>Create Road Citizen Inspector webhook</span> to finish the integration.
        </p>
      ),
      note: {
        type: 'attention',
        children: (
          <p>
            Sessions are temporary. After 24 hours, your session will expire, and you'll need to repeat this process to generate a new one.
          </p>
        ),
      },
    },
  ]

  return (
    <div className="flex flex-col items-center w-full @md:max-w-[800px] @xl:max-w-[1000px] gap-10">
      <header>
        <SectionLabel size="lg" textColor="black">
          Link Your Things Stack Application
        </SectionLabel>
        <p className="text-neutral-500 text-base/relaxed">
          Link your Things Stack application to this session using an provided
          Webhook Key. Using the webhook key, use the Road Citizen Inspector
          Webhook template to share your Traffic Counting Device uplinks to this
          session.
        </p>
      </header>
      <Container className="w-full @md:max-w-[800px] @container">
        <article className="flex flex-row items-center overflow-x-auto gap-8 @lg:flex-row snap-x scroll-smooth snap-mandatory *:snap-center *:snap-always">
          {directionSteps.map((step, index) => (
            <section key={index} className="flex flex-col gap-4 min-w-full w-full max-w-full p-2">
              <h3 className="text-xl font-semibold tracking-wide">
                <span className="font-bold text-amber-600">
                  Step {index + 1}:
                </span>{' '}
                {step.title}
              </h3>
              <img
                src={step.image}
                alt={`Step ${index + 1} image`}
                className="border border-neutral-200 rounded-lg"
              />
                  {step.description}
                {step.note &&
                  (Array.isArray(step.note) ? (
                    step.note.map((note, noteIndex) => (
                      <Note
                        key={noteIndex}
                        type={note.type}
                      >
                        {note.children}
                      </Note>
                    ))
                  ) : (
                    <Note type={step.note.type}>
                      {step.note.children}
                    </Note>
                  ))}
            </section>
          ))}
        </article>
      </Container>
    </div>
  )
}
