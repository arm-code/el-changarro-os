'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { EditorSheet } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BusinessValue } from '@/types/finance'

export function ValuesSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, addValue, updateValue, removeValue } = useBusinessConfig()
    const values = config?.values || []

    const [isAdding, setIsAdding] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [newIcon, setNewIcon] = useState('star')

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editIcon, setEditIcon] = useState('')

    const handleAdd = async () => {
        if (!newTitle.trim()) return

        const promise = addValue.mutateAsync({ 
            title: newTitle, 
            description: newDesc, 
            icon: newIcon,
            order: values.length 
        })
        
        toast.promise(promise, {
            loading: 'Agregando valor...',
            success: 'Agregado correctamente',
            error: 'Error al agregar',
        })

        promise.then(() => {
            setIsAdding(false)
            setNewTitle('')
            setNewDesc('')
            setNewIcon('star')
        }).catch(() => {})
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este valor corporativo?')) return
        
        toast.promise(
            removeValue.mutateAsync(id),
            {
                loading: 'Eliminando...',
                success: 'Eliminado',
                error: 'Error al eliminar',
            }
        )
    }

    const startEdit = (item: BusinessValue) => {
        setEditingId(item.id)
        setEditTitle(item.title)
        setEditDesc(item.description || '')
        setEditIcon(item.icon || 'star')
    }

    const saveEdit = async (id: string) => {
        const item = values.find(g => g.id === id)
        if (item && item.title === editTitle && item.description === editDesc && item.icon === editIcon) {
            setEditingId(null)
            return
        }

        const promise = updateValue.mutateAsync({ id, data: { title: editTitle, description: editDesc, icon: editIcon } })

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
            title="Valores corporativos"
            description="Agrega los valores, misión o características que te distinguen."
            formId="values-form"
            saveLabel="Cerrar"
            isDirty={false}
            isPending={false}
            tall
        >
            <div className="space-y-6">
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Valor
                    </Button>
                )}

                {isAdding && (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Título</label>
                            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ej. Responsabilidad" className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Descripción (Opcional)</label>
                            <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Compromiso con el cliente..." className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Icono (lucide-react)</label>
                            <Input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="star" className="bg-white" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white" disabled={addValue.isPending || !newTitle.trim()}>
                                Guardar
                            </Button>
                            <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {values.length === 0 && !isAdding ? (
                    <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        No has agregado ningún valor todavía.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {values.map((item) => (
                            <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300">
                                {editingId === item.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" className="h-9" />
                                            <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción" className="h-9" />
                                            <Input value={editIcon} onChange={e => setEditIcon(e.target.value)} placeholder="Icono" className="h-9" />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                                            <Button size="sm" onClick={() => saveEdit(item.id)} disabled={updateValue.isPending}>Guardar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-violet-900 text-sm">{item.title}</p>
                                            {item.description && <p className="text-xs text-violet-600 mt-1">{item.description}</p>}
                                            {item.icon && <p className="text-[10px] text-gray-400 mt-1">Icono: {item.icon}</p>}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" disabled={removeValue.isPending}>
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
            
            <form id="values-form" onSubmit={e => { e.preventDefault(); onOpenChange(false); }} className="hidden" />
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
