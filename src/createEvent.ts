/*
Create events for the DOM
*/

import { RefObject } from 'react'
import { getElement, Unsubscribe } from './utils'

export type SupportEventTarget = Window | Element | Document | EventSource | AbortSignal |
  Animation | ApplicationCache | AudioScheduledSourceNode | BaseAudioContext |
  AudioWorkletNode | BroadcastChannel | TextTrackCue | TextTrackList |
  WebSocket | Worker | XMLHttpRequest | XMLHttpRequestEventTarget |
  RTCPeerConnection | EventTarget

export type EventMap<T extends SupportEventTarget>
  = T extends Window ? WindowEventMap
  : T extends Document ? DocumentEventMap
  : T extends HTMLMediaElement ? HTMLMediaElementEventMap
  : T extends HTMLElement ? HTMLElementEventMap
  : T extends EventSource ? EventSourceEventMap
  : T extends AbortSignal ? AbortSignalEventMap
  : T extends Worker ? WorkerEventMap
  : T extends Animation ? AnimationEventMap
  : T extends ApplicationCache ? ApplicationCacheEventMap
  : T extends AudioScheduledSourceNode ? AudioScheduledSourceNodeEventMap
  : T extends BaseAudioContext ? BaseAudioContextEventMap
  : T extends AudioWorkletNode ? AudioWorkletNodeEventMap
  : T extends BroadcastChannel ? BroadcastChannelEventMap
  : T extends TextTrackCue ? TextTrackCueEventMap
  : T extends TextTrackList ? TextTrackListEventMap
  : T extends WebSocket ? WebSocketEventMap
  : T extends XMLHttpRequest ? XMLHttpRequestEventMap
  : T extends XMLHttpRequestEventTarget ? XMLHttpRequestEventTargetEventMap
  : T extends RTCPeerConnection ? RTCPeerConnectionEventMap
  : T extends Element ? ElementEventMap
  : T extends EventTarget ? Record<string, Event>
  : never

export type EventNameMap<T extends SupportEventTarget>
  = keyof EventMap<T>

export type EventListenerMap<T extends SupportEventTarget, K extends EventNameMap<T>>
  = (this: T, event: EventMap<T>[K]) => any

/**
 * users can augment this interface to accept other eventmap, like below
 * ```jsx
 *   interface CreateEvent extends CreateEventHelper<NewTarget, NewEventMap> {
 *   }
 * ```
 * this will bind createEvent a `NewEventMap` to `NewTarget`
 */
export interface CreateEvent {
  <T extends SupportEventTarget, N extends EventNameMap<T>>(
    target: T | RefObject<T> | null,
    type: N | N[],
    listener: EventListenerMap<T, N>,
    options?: boolean | AddEventListenerOptions,
  ): Unsubscribe | undefined
}

export const createEvent: CreateEvent = function createEvent(
  domElementOrRef,
  eventName,
  eventListener,
  options = false,
) {
  const eventNames = Array.isArray(eventName) ? eventName : [ eventName ]
  if (!domElementOrRef) return
  const element = getElement(domElementOrRef)
  if (element) {
    eventNames.forEach(name => element.addEventListener(name as string, eventListener as any, options))
    return () => eventNames.forEach(name => element.removeEventListener(name as string, eventListener as any, options))
  }
}

export type CreateEventHelper<
  Targets extends EventTarget,
  EventMap extends Record<string, Event>,
> = <T extends Targets, N extends keyof EventMap>(
  target: T | RefObject<T> | null,
  type: N | readonly N[],
  listener: (this: T, event: EventMap[N]) => any,
  options?: boolean | AddEventListenerOptions,
) => Unsubscribe | undefined
