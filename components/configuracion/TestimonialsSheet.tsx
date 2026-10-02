'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, X, Star } from 'lucide-react'
import { toast } from 'sonner'
import { EditorSheet } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Testimonial } from '@/types/finance'
import { cn } from '@/lib/utils'

export function TestimonialsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, addTestimonial, updateTestimonial, removeTestimonial } = useBusinessConfig()
    const testimonials = config?.testimonials || []

    const [isAdding, setIsAdding] = useState(false)
    const [newText, setNewText] = useState('')
    const [newAuthor, setNewAuthor] = useState('')
    const [newRating, setNewRating] = useState(5)

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')
    const [editAuthor, setEditAuthor] = useState('')
    const [editRating, setEditRating] = useState(5)

    const handleAdd = async () => {
        if (!newText.trim() || !newAuthor.trim()) return

        const promise = addTestimonial.mutateAsync({ 
            text: newText, 
            author: newAuthor, 
            rating: newRating,
            order: testimonials.length 
        })
        
        toast.promise(promise, {
            loading: 'Agregando testimonio...',
            success: 'Agregado correctamente',
            error: 'Error al agregar',
        })

        promise.then(() => {
            setIsAdding(false)
            setNewText('')
            setNewAuthor('')
            setNewRating(5)
        }).catch(() => {})
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este testimonio?')) return
        
        toast.promise(
            removeTestimonial.mutateAsync(id),
            {
                loading: 'Eliminando...',
                success: 'Eliminado',
                error: 'Error al eliminar',
            }
        )
    }

    const startEdit = (item: Testimonial) => {
        setEditingId(item.id)
        setEditText(item.text)
        setEditAuthor(item.author)
        setEditRating(item.rating)
    }

    const saveEdit = async (id: string) => {
        const item = testimonials.find(g => g.id === id)
        if (item && item.text === editText && item.author === editAuthor && item.rating === editRating) {
            setEditingId(null)
            return
        }

        const promise = updateTestimonial.mutateAsync({ id, data: { text: editText, author: editAuthor, rating: editRating } })

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
            title="Testimonios"
            description="Lo que dicen tus clientes sobre tu negocio."
            formId="testimonials-form"
            saveLabel="Cerrar"
            isDirty={false}
            isPending={false}
            tall
        >
            <div className="space-y-6">
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Testimonio
                    </Button>
                )}

                {isAdding && (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Testimonio</label>
                            <Input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Excelente servicio..." className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Autor / Cliente</label>
                            <Input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Juan Pérez" className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Calificación (1-5)</label>
                            <Input type="number" min={1} max={5} value={newRating} onChange={e => setNewRating(Number(e.target.value))} className="bg-white" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white" disabled={addTestimonial.isPending || !newText.trim() || !newAuthor.trim()}>
                                Guardar
                            </Button>
                            <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {testimonials.length === 0 && !isAdding ? (
                    <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        No has agregado testimonios todavía.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {testimonials.map((item) => (
                            <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300">
                                {editingId === item.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Input value={editText} onChange={e => setEditText(e.target.value)} placeholder="Testimonio" className="h-9" />
                                            <Input value={editAuthor} onChange={e => setEditAuthor(e.target.value)} placeholder="Autor" className="h-9" />
                                            <Input type="number" min={1} max={5} value={editRating} onChange={e => setEditRating(Number(e.target.value))} className="h-9" />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                                            <Button size="sm" onClick={() => saveEdit(item.id)} disabled={updateTestimonial.isPending}>Guardar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex gap-0.5 mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={cn("w-3.5 h-3.5", i < item.rating ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-violet-700 italic">&ldquo;{item.text}&rdquo;</p>
                                            <p className="text-xs font-bold text-violet-900 mt-1">— {item.author}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" disabled={removeTestimonial.isPending}>
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
            
            <form id="testimonials-form" onSubmit={e => { e.preventDefault(); onOpenChange(false); }} className="hidden" />
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
