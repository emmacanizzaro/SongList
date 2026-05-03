import { useState } from 'react'
import { EventData, Joyride, STATUS, Step } from 'react-joyride'

const steps: Step[] = [
  {
    target: "[data-tour='dashboard-welcome']",
    content: '¡Bienvenido a SongList! Aquí verás el resumen de tu equipo y tus próximas reuniones.',
  },
  {
    target: "[data-tour='dashboard-new-song']",
    content: 'Haz clic aquí para agregar una nueva canción a tu biblioteca.',
  },
  {
    target: "[data-tour='dashboard-new-meeting']",
    content: 'Aquí puedes programar una nueva reunión o ensayo.',
  },
  {
    target: "[data-tour='dashboard-sidebar']",
    content: 'Navega entre secciones usando este menú lateral.',
    placement: 'right',
  },
]

export function DashboardOnboarding() {
  const [run, setRun] = useState(true)

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      // Aquí podrías guardar en localStorage que el usuario ya vio el tutorial
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      options={{
        buttons: ['back', 'close', 'primary', 'skip'],
        showProgress: true,
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
      onEvent={handleJoyrideCallback}
      styles={{
        floater: {
          zIndex: 10000,
        },
      }}
    />
  )
}
