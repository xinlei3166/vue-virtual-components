// https://github.com/vueComponent/ant-design-vue/blob/next/components/vc-table/hooks/useFrame.ts
import type { Ref, UnwrapRef } from 'vue'
import { onBeforeUnmount, ref } from 'vue'

export type Updater<State> = (prev: State) => State

/**
 * Execute code before next frame but async
 */
export function useLayoutState<State>(
  defaultState: State
): [Ref<State>, (updater: Updater<State>) => void] {
  const stateRef = ref<State>(defaultState)
  // const [, forceUpdate] = useState({});

  const lastPromiseRef = ref<Promise<void> | null>(null)
  const updateBatchRef = ref<Updater<State>[]>([])
  function setFrameState(updater: Updater<State>) {
    updateBatchRef.value.push(updater)

    const promise = Promise.resolve()
    lastPromiseRef.value = promise

    promise.then(() => {
      if (lastPromiseRef.value === promise) {
        const prevBatch = updateBatchRef.value
        // const prevState = stateRef.value;
        updateBatchRef.value = []

        prevBatch.forEach(batchUpdater => {
          stateRef.value = batchUpdater(
            stateRef.value as State
          ) as UnwrapRef<State>
        })

        lastPromiseRef.value = null
      }
    })
  }

  onBeforeUnmount(() => {
    lastPromiseRef.value = null
  })

  return [stateRef as Ref<State>, setFrameState]
}
