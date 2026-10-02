'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { EditorSheet } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Faq } from '@/types/finance'

export function FaqsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, addFaq, updateFaq, removeFaq } = useBusinessConfig()
    const faqs = config?.faqs || []

    const [isAdding, setIsAdding] = useState(false)
    const [newQuestion, setNewQuestion] = useState('')
    const [newAnswer, setNewAnswer] = useState('')

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editQuestion, setEditQuestion] = useState('')
    const [editAnswer, setEditAnswer] = useState('')

    const handleAdd = async () => {
        if (!newQuestion.trim() || !newAnswer.trim()) return

        const promise = addFaq.mutateAsync({ 
            question: newQuestion, 
            answer: newAnswer, 
            order: faqs.length 
        })
        
        toast.promise(promise, {
            loading: 'Agregando pregunta...',
            success: 'Agregada correctamente',
            error: 'Error al agregar',
        })

        promise.then(() => {
            setIsAdding(false)
            setNewQuestion('')
            setNewAnswer('')
        }).catch(() => {})
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar esta pregunta?')) return
        
        toast.promise(
            removeFaq.mutateAsync(id),
            {
                loading: 'Eliminando...',
                success: 'Eliminada',
                error: 'Error al eliminar',
            }
        )
    }

    const startEdit = (item: Faq) => {
        setEditingId(item.id)
        setEditQuestion(item.question)
        setEditAnswer(item.answer)
    }

    const saveEdit = async (id: string) => {
        const item = faqs.find(g => g.id === id)
        if (item && item.question === editQuestion && item.answer === editAnswer) {
            setEditingId(null)
            return
        }

        const promise = updateFaq.mutateAsync({ id, data: { question: editQuestion, answer: editAnswer } })

        toast.promise(promise, {
            loading: 'Guardando...',
            success: 'Guardado',
            error: 'Error al guardar',
        })

        promise.then(() => setEditingId(null)).catch(() => {})
    }

    return (
        <EditorSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Preguntas Frecuentes"
            description="Agrega las dudas más comunes de tus clientes."
            formId="faqs-form"
            saveLabel="Cerrar"
            isDirty={false}
            isPending={false}
            tall
        >
            <div className="space-y-6">
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Pregunta
                    </Button>
                )}

                {isAdding && (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Pregunta</label>
                            <Input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="¿Con cuánto tiempo debo reservar?" className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Respuesta</label>
                            <Textarea value={newAnswer} onChange={e => setNewAnswer(e.target.value)} placeholder="Te sugerimos reservar con al menos 2 semanas..." className="bg-white min-h-[80px]" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white" disabled={addFaq.isPending || !newQuestion.trim() || !newAnswer.trim()}>
                                Guardar
                            </Button>
                            <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {faqs.length === 0 && !isAdding ? (
                    <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        No has agregado preguntas todavía.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {faqs.map((item) => (
                            <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300">
                                {editingId === item.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Input value={editQuestion} onChange={e => setEditQuestion(e.target.value)} placeholder="Pregunta" className="font-medium" />
                                            <Textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} placeholder="Respuesta" className="text-sm min-h-[80px]" />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                                            <Button size="sm" onClick={() => saveEdit(item.id)} disabled={updateFaq.isPending}>Guardar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-violet-900 text-sm">{item.question}</p>
                                            <p className="text-sm text-violet-600 mt-1 whitespace-pre-wrap">{item.answer}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" disabled={removeFaq.isPending}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <form id="faqs-form" onSubmit={e => { e.preventDefault(); onOpenChange(false); }} className="hidden" />
        </EditorSheet>
    )
}

function Edit2Icon(props: React.ComponentProps<'svg'>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    )
}
