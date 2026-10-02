'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { EditorSheet } from './EditorSheet'
import { useBusinessConfig } from './useBusinessConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '@/types/finance'

export function GallerySheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { config, addGallery, updateGallery, removeGallery } = useBusinessConfig()
    const gallery = config?.gallery || []

    const [isUploading, setIsUploading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editLabel, setEditLabel] = useState('')

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const promise = addGallery.mutateAsync({ file, order: gallery.length })
        
        toast.promise(promise, {
            loading: 'Subiendo imagen...',
            success: 'Imagen subida correctamente',
            error: 'Error al subir imagen',
        })

        promise.finally(() => {
            setIsUploading(false)
            if (e.target) e.target.value = ''
        }).catch(() => {})
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return
        
        toast.promise(
            removeGallery.mutateAsync(id),
            {
                loading: 'Eliminando...',
                success: 'Imagen eliminada',
                error: 'Error al eliminar',
            }
        )
    }

    const startEdit = (item: GalleryItem) => {
        setEditingId(item.id)
        setEditLabel(item.label || '')
    }

    const saveEdit = async (id: string) => {
        const item = gallery.find(g => g.id === id)
        if (item && item.label === editLabel) {
            setEditingId(null)
            return
        }

        const promise = updateGallery.mutateAsync({ id, data: { label: editLabel } })

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
            title="Catálogo de imágenes"
            description="Agrega fotos de tus productos o servicios."
            formId="gallery-form"
            saveLabel="Cerrar"
            isDirty={false}
            isPending={false}
            tall
        >
            <div className="space-y-6">
                <label className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm font-medium transition-colors cursor-pointer",
                    isUploading ? "border-gray-200 bg-gray-100 text-gray-400" : "border-violet-200 bg-violet-50/50 text-violet-700 hover:bg-violet-100"
                )}>
                    <ImagePlus className={cn("h-8 w-8", isUploading ? "text-gray-400" : "text-violet-600")} />
                    <span>{isUploading ? 'Subiendo...' : 'Haz clic para subir una imagen'}</span>
                    <span className={cn("text-xs", isUploading ? "text-gray-400" : "text-violet-500")}>JPG, PNG, WebP</span>
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading || addGallery.isPending}
                    />
                </label>

                {gallery.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        No has subido ninguna imagen todavía.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {gallery.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-violet-300">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                                    <Image src={item.url} alt={item.alt || item.label || 'Imagen'} fill className="object-cover" />
                                </div>
                                <div className="flex flex-1 flex-col justify-center min-w-0">
                                    {editingId === item.id ? (
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                value={editLabel} 
                                                onChange={e => setEditLabel(e.target.value)} 
                                                placeholder="Ej. Sillas plegables"
                                                className="h-9 text-sm"
                                                autoFocus
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        saveEdit(item.id)
                                                    }
                                                }}
                                            />
                                            <Button size="icon" variant="ghost" onClick={() => saveEdit(item.id)} className="h-9 w-9 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-9 w-9 shrink-0 text-gray-400 hover:text-gray-500 hover:bg-gray-50">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="truncate">
                                                <p className="font-medium text-gray-900 text-sm truncate">
                                                    {item.label || <span className="text-gray-400 italic font-normal">Sin título</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button size="icon" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" disabled={removeGallery.isPending}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* El EditorSheet requiere un form con el ID indicado */}
            <form id="gallery-form" onSubmit={e => { e.preventDefault(); onOpenChange(false); }} className="hidden" />
        </EditorSheet>
    )
}
