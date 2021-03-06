import { useEffect, DependencyList, useState, useRef } from 'react'

const incr = (cnt: number) => cnt + 1

export interface UseRaf {
  /**
   * use request animation frame (raf) hook with callback
   * @param timeoutMs timeout to cancel raf, -1 indicate never cancel
   * @param delayMs delay to start raf or stop raf when given null
   * @param callback raf callback
   * @param deps dependency list
   */
  (
    timeoutMs?: number,
    delayMs?: number | null,
    callback?: () => void,
    deps?: DependencyList
  ): void

  /**
   * use request animation frame (raf) hook to force update
   * @param timeoutMs timeout to cancel raf
   * @param delayMs delay to start raf or stop raf when given null
   * @param deps dependency list
   */
  (
    timeoutMs?: number,
    delayMs?: number | null,
    deps?: DependencyList
  ): void
}

export const useRaf: UseRaf = function useRaf(
  timeoutMs = 1e10,
  delayMs: number | null = 0,
  callback?: (() => void) | DependencyList,
  deps: DependencyList = [],
) {
  timeoutMs = timeoutMs < 0 ? 1e10 : timeoutMs
  const [ , update ] = useState(0)
  const cbRef = useRef<() => void>(null!)
  if (callback instanceof Function) {
    cbRef.current = callback
  } else {
    cbRef.current = () => update(incr)
    if (Array.isArray(callback)) {
      deps = callback
    }
  }

  useEffect(() => {
    if (delayMs !== null) {
      // start raf
      let raf = 0
      let timerStop: ReturnType<typeof setTimeout>
      let stopped = false

      const onFrame = () => {
        cbRef.current()
        loop()
      }

      const loop = () => {
        raf = stopped ? 0 : requestAnimationFrame(onFrame)
      }

      const onStart = () => {
        timerStop = setTimeout(() => {
          cancelAnimationFrame(raf)
          cbRef.current()
          stopped = true
        }, timeoutMs)
        loop()
      }

      const timerDelay = setTimeout(onStart, delayMs)

      return () => {
        clearTimeout(timerStop)
        clearTimeout(timerDelay)
        cancelAnimationFrame(raf)
        stopped = true
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ timeoutMs, delayMs, ...deps ])
}
