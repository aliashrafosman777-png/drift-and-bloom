// @ts-nocheck
"use client"

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { QUESTIONS } from './quizData'
import { computeResult } from './scoring'
import ProgressBar from './ProgressBar'
import QuestionCard from './QuestionCard'
import ResultCard from './ResultCard'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import LoadingFallback from '../../components/common/LoadingFallback'

const TOTAL = QUESTIONS.length

export default function Quiz() {
  const { isAuthenticated } = useAuth()

  const [currentIdx, setCurrentIdx] = useState(0)  // 0-based index into QUESTIONS
  const [answers, setAnswers]       = useState({})  // { questionId: optionIndex }
  const [direction, setDirection]   = useState('forward')
  const [animKey, setAnimKey]       = useState(0)
  const [done, setDone]             = useState(false)
  const [result, setResult]         = useState(null)
  const [isLoaded, setIsLoaded]     = useState(false)

  // Load progress from localStorage and database on mount
  useEffect(() => {
    let active = true

    async function loadProgress() {
      // 1. Check localStorage first for immediate local state
      let progress = null
      const localData = localStorage.getItem('db_game_progress')
      if (localData) {
        try {
          progress = JSON.parse(localData)
        } catch (e) {
          console.error('Error parsing local progress:', e)
        }
      }

      // 2. If authenticated, fetch from DB
      if (isAuthenticated) {
        try {
          const res = await apiFetch('/api/game/progress')
          if (res.success && res.data && active) {
            progress = res.data
            // Update localStorage to match DB
            localStorage.setItem('db_game_progress', JSON.stringify(progress))
          }
        } catch (err) {
          console.error('Failed to load progress from DB:', err)
        }
      }

      // 3. Hydrate state
      if (progress && active) {
        if (progress.currentIdx !== undefined) setCurrentIdx(progress.currentIdx)
        if (progress.answers) setAnswers(progress.answers)
        if (progress.done !== undefined) setDone(progress.done)
        if (progress.result !== undefined) setResult(progress.result)
      }
      if (active) {
        setIsLoaded(true)
      }
    }

    loadProgress()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  // Save progress on changes to answers or state
  useEffect(() => {
    if (!isLoaded) return

    const progress = { currentIdx, answers, done, result }
    localStorage.setItem('db_game_progress', JSON.stringify(progress))

    if (isAuthenticated) {
      const timer = setTimeout(async () => {
        try {
          await apiFetch('/api/game/progress', {
            method: 'POST',
            body: JSON.stringify(progress),
          })
        } catch (err) {
          console.error('Failed to save progress to DB:', err)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentIdx, answers, done, result, isLoaded, isAuthenticated])

  const currentQ  = QUESTIONS[currentIdx]
  const isFirst   = currentIdx === 0
  const isLast    = currentIdx === TOTAL - 1
  const selected  = answers[currentQ?.id] ?? null

  const canProceed = selected !== null && selected !== undefined

  // Select an option
  const handleSelect = useCallback((questionId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }))
  }, [])

  // Go forward
  const handleNext = useCallback(() => {
    if (!canProceed) return

    if (isLast) {
      // Compute result and show results screen
      const res = computeResult(answers)
      setResult(res)
      setDone(true)
      return
    }

    setDirection('forward')
    setAnimKey((k) => k + 1)
    setCurrentIdx((i) => i + 1)
  }, [canProceed, isLast, answers])

  // Go backward
  const handleBack = useCallback(() => {
    if (isFirst) return
    setDirection('backward')
    setAnimKey((k) => k + 1)
    setCurrentIdx((i) => i - 1)
  }, [isFirst])

  // Allow pressing Enter to advance
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && canProceed) handleNext()
      if (e.key === 'ArrowRight' && canProceed) handleNext()
      if (e.key === 'ArrowLeft' && !isFirst) handleBack()
    },
    [canProceed, handleNext, handleBack, isFirst]
  )

  // Reset quiz
  const handleRetake = useCallback(async () => {
    setCurrentIdx(0)
    setAnswers({})
    setDone(false)
    setResult(null)
    setDirection('forward')
    setAnimKey((k) => k + 1)

    // Clear progress from localStorage and database
    localStorage.removeItem('db_game_progress')
    if (isAuthenticated) {
      try {
        await apiFetch('/api/game/progress', {
          method: 'DELETE',
        })
      } catch (err) {
        console.error('Failed to reset progress in DB:', err)
      }
    }
  }, [isAuthenticated])

  if (!isLoaded) {
    return <LoadingFallback label="Loading your quiz progress..." />
  }

  if (done && result) {
    return (
      <div className="animate-fade-in">
        <ResultCard result={result} onRetake={handleRetake} />
      </div>
    )
  }

  return (
    <div
      className="w-full outline-none"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Soul quiz"
    >
      <ProgressBar
        currentQuestion={currentIdx + 1}
        totalQuestions={TOTAL}
        currentSection={currentQ.section}
      />

      <QuestionCard
        key={animKey}
        question={currentQ}
        selectedOption={selected}
        onSelect={handleSelect}
        direction={direction}
        animKey={animKey}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirst}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium
            uppercase tracking-label transition duration-300 ${
            isFirst
              ? 'text-charcoal/20 cursor-not-allowed'
              : 'text-charcoal/60 hover:text-olive hover:bg-beige'
          }`}
          aria-label="Previous question"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1.5">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIdx
                  ? 'w-5 h-2 bg-olive'
                  : answers[QUESTIONS[i].id] !== undefined
                  ? 'w-2 h-2 bg-olive/40'
                  : 'w-2 h-2 bg-charcoal/15'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium
            uppercase tracking-label transition duration-300 ${
            canProceed
              ? isLast
                ? 'bg-olive text-cream hover:bg-olive-dark hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lift'
                : 'bg-olive text-cream hover:bg-olive-dark hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lift'
              : 'bg-charcoal/10 text-charcoal/30 cursor-not-allowed'
          }`}
          aria-label={isLast ? 'See my result' : 'Next question'}
        >
          {isLast ? 'See My Result' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>

      {!canProceed && (
        <p className="text-xs text-charcoal/35 text-center mt-3 animate-fade-in">
          Please choose an answer to continue
        </p>
      )}

      {!isFirst && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleRetake}
            className="flex items-center gap-1 text-[11px] text-charcoal/40 hover:text-red-500 transition duration-200 underline underline-offset-2"
          >
            Reset Progress & Start Over
          </button>
        </div>
      )}
    </div>
  )
}
