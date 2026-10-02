'use client'

import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { EditorSheet } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BusinessStat } from '@/types/finance'

export function StatsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, addStat, updateStat, removeStat } = useBusinessConfig()
    const stats = config?.stats || []

    const [isAdding, setIsAdding] = useState(false)
    const [newValue, setNewValue] = useState('')
    const [newLabel, setNewLabel] = useState('')

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [editLabel, setEditLabel] = useState('')

    const handleAdd = async () => {
        if (!newValue.trim() || !newLabel.trim()) return

        const promise = addStat.mutateAsync({ 
            value: newValue, 
            label: newLabel, 
            order: stats.length 
        })
        
        toast.promise(promise, {
            loading: 'Agregando estadística...',
            success: 'Agregada correctamente',
            error: 'Error al agregar',
        })

        promise.then(() => {
            setIsAdding(false)
            setNewValue('')
            setNewLabel('')
        }).catch(() => {})
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar esta estadística?')) return
        
        toast.promise(
            removeStat.mutateAsync(id),
            {
                loading: 'Eliminando...',
                success: 'Eliminada',
                error: 'Error al eliminar',
            }
        )
    }

    const startEdit = (item: BusinessStat) => {
        setEditingId(item.id)
        setEditValue(item.value)
        setEditLabel(item.label)
    }

    const saveEdit = async (id: string) => {
        const item = stats.find(g => g.id === id)
        if (item && item.value === editValue && item.label === editLabel) {
            setEditingId(null)
            return
        }

        const promise = updateStat.mutateAsync({ id, data: { value: editValue, label: editLabel } })

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
            title="Estadísticas (En números)"
            description="Muestra datos clave de tu negocio para generar confianza."
            formId="stats-form"
            saveLabel="Cerrar"
            isDirty={false}
            isPending={false}
            tall
        >
            <div className="space-y-6">
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Estadística
                    </Button>
                )}

                {isAdding && (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Valor (ej. +500)</label>
                            <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="+500" className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-violet-900 mb-1 block">Etiqueta (ej. Eventos atendidos)</label>
                            <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Eventos atendidos" className="bg-white" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAdd} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white" disabled={addStat.isPending || !newValue.trim() || !newLabel.trim()}>
                                Guardar
                            </Button>
                            <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {stats.length === 0 && !isAdding ? (
                    <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        No has agregado ninguna estadística todavía.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {stats.map((item) => (
                            <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300">
                                {editingId === item.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1 block">Valor</label>
                                                <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-9" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1 block">Etiqueta</label>
                                                <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="h-9" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                                            <Button size="sm" onClick={() => saveEdit(item.id)} disabled={updateStat.isPending}>Guardar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-violet-900 text-lg">{item.value}</p>
                                            <p className="text-sm text-violet-600">{item.label}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                                <Edit2Icon className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" disabled={removeStat.isPending}>
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
            
            <form id="stats-form" onSubmit={e => { e.preventDefault(); onOpenChange(false); }} className="hidden" />
        </EditorSheet>
    )
}

function Edit2Icon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    )
}
