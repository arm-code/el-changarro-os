// components/configuracion/BankAccountsSheet.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ChevronLeft, Copy, Loader2, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { financeApi } from '@/lib/api/finance'
import { bankFromClabe, digitsOnly, formatInGroups, isValidCardNumber, isValidClabe } from '@/lib/bank'
import type { CreatePaymentCardDto, PaymentCard } from '@/types/finance'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { TOUCH } from '@/components/ui/detail'
import { EmptyState } from '@/components/ui/states'
import { FormField, INPUT_CLASS } from './EditorSheet'

const FORM_ID = 'bank-account-form'

const schema = yup
    .object({
        clabe: yup
            .string()
            .test('len', 'La CLABE tiene 18 dígitos', (v) => !digitsOnly(v) || digitsOnly(v).length === 18)
            .test('check', 'Revisa la CLABE: algún número no coincide', (v) => digitsOnly(v).length !== 18 || isValidClabe(digitsOnly(v))),
        cardNumber: yup
            .string()
            .test('len', 'La tarjeta tiene 16 dígitos', (v) => !digitsOnly(v) || [15, 16].includes(digitsOnly(v).length))
            .test('luhn', 'Revisa el número de tarjeta', (v) => !digitsOnly(v) || isValidCardNumber(digitsOnly(v))),
        bank: yup.string().trim().required('Escribe el banco').max(50, 'Máximo 50 caracteres'),
        beneficiary: yup.string().trim().required('Escribe el nombre del titular').max(100, 'Máximo 100 caracteres'),
    })
    .test('clabe-or-card', '', function (v) {
        if (digitsOnly(v.clabe) || digitsOnly(v.cardNumber)) return true
        return this.createError({ path: 'clabe', message: 'Escribe la CLABE o el número de tarjeta' })
    })

const EMPTY = { clabe: '', cardNumber: '', bank: '', beneficiary: '' }

interface BankAccountsSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    accounts: PaymentCard[]
}

export function BankAccountsSheet({ open, onOpenChange, accounts }: BankAccountsSheetProps) {
    const queryClient = useQueryClient()
    const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
    const [toDelete, setToDelete] = useState<PaymentCard | null>(null)
    const [editingAccount, setEditingAccount] = useState<PaymentCard | null>(null)
    const autofilledBank = useRef('')

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema), defaultValues: EMPTY })

    useEffect(() => {
        if (open) setMode('list')
    }, [open])

    useEffect(() => {
        if (mode === 'add') {
            reset(EMPTY)
            autofilledBank.current = ''
        }
    }, [mode, reset])

    // El banco sale de los primeros 3 dígitos de la CLABE; solo se llena si el usuario no lo escribió
    const clabe = digitsOnly(watch('clabe'))
    useEffect(() => {
        const bank = bankFromClabe(clabe)
        const current = getValues('bank')
        if (bank && (!current || current === autofilledBank.current)) {
            setValue('bank', bank, { shouldValidate: Boolean(errors.bank) })
            autofilledBank.current = bank
        }
    }, [clabe, getValues, setValue, errors.bank])

    const addMutation = useMutation({
        mutationFn: (data: CreatePaymentCardDto) => financeApi.addPaymentCard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
            toast.success('Cuenta agregada')
            setMode('list')
        },
        onError: (err: unknown) => {
            console.error('[BankAccountsSheet] addPaymentCard', err)
            toast.error('No se pudo agregar la cuenta', { description: 'Revisa tu conexión e intenta de nuevo.' })
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentCardDto> }) => financeApi.updatePaymentCard(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
            toast.success('Cuenta actualizada')
            setMode('list')
            setEditingAccount(null)
        },
        onError: (err: unknown) => {
            console.error('[BankAccountsSheet] updatePaymentCard', err)
            toast.error('No se pudo actualizar la cuenta', { description: 'Revisa tu conexión e intenta de nuevo.' })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => financeApi.deletePaymentCard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessConfig'] })
            toast.success('Cuenta eliminada')
            setToDelete(null)
        },
        onError: (err: unknown) => {
            console.error('[BankAccountsSheet] deletePaymentCard', err)
            toast.error('No se pudo eliminar la cuenta', { description: 'Revisa tu conexión e intenta de nuevo.' })
        },
    })

    const handleEdit = (account: PaymentCard) => {
        setEditingAccount(account)
        reset({
            clabe: account.clabe || '',
            cardNumber: account.cardNumber || '',
            bank: account.bank || '',
            beneficiary: account.beneficiary || '',
        })
        autofilledBank.current = account.bank || ''
        setMode('edit')
    }

    const onSubmit = handleSubmit((v) => {
        const payload = {
            bank: v.bank.trim(),
            beneficiary: v.beneficiary.trim(),
            clabe: digitsOnly(v.clabe),
            cardNumber: digitsOnly(v.cardNumber),
        }
        if (mode === 'edit' && editingAccount?.id) {
            updateMutation.mutate({ id: editingAccount.id, data: payload })
        } else {
            addMutation.mutate(payload)
        }
    })

    const copy = async (digits: string, what: string) => {
        try {
            await navigator.clipboard.writeText(digits)
            toast.success(`${what} copiada`)
        } catch {
            toast.error('No se pudo copiar')
        }
    }

    const isForm = mode === 'add' || mode === 'edit'
    const isPending = addMutation.isPending || updateMutation.isPending

    return (
        <>
            <AppBottomSheet
                open={open}
                onOpenChange={onOpenChange}
                title={mode === 'add' ? 'Agregar cuenta' : mode === 'edit' ? 'Editar cuenta' : 'Cuentas para recibir pagos'}
                description={isForm ? undefined : 'Aparecen en tus notas y contratos para que te depositen.'}
                footer={
                    isForm ? (
                        <Button type="submit" form={FORM_ID} className={cn(TOUCH, 'w-full')} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" aria-hidden />
                                    Guardando…
                                </>
                            ) : (
                                'Guardar cuenta'
                            )}
                        </Button>
                    ) : (
                        <Button className={cn(TOUCH, 'w-full')} onClick={() => setMode('add')}>
                            Agregar cuenta
                        </Button>
                    )
                }
            >
                {isForm ? (
                    <div className="space-y-6">
                        <Button variant="ghost" className="-ml-3 h-11 rounded-xl px-3 text-[15px] text-muted-foreground" onClick={() => setMode('list')}>
                            <ChevronLeft aria-hidden />
                            Cuentas
                        </Button>

                        <form id={FORM_ID} noValidate onSubmit={onSubmit} className="space-y-6">
                            <FormField id="clabe" label="CLABE" hint="Los 18 dígitos. El banco se llena solo." error={errors.clabe?.message}>
                                <Input
                                    id="clabe"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={24}
                                    placeholder="0121 8000 0000 0000 00"
                                    aria-invalid={Boolean(errors.clabe)}
                                    className={cn(INPUT_CLASS, 'tabular-nums', errors.clabe && 'border-destructive')}
                                    {...register('clabe')}
                                />
                            </FormField>

                            <FormField id="cardNumber" label="Número de tarjeta (opcional)" hint="Para depósitos en tienda." error={errors.cardNumber?.message}>
                                <Input
                                    id="cardNumber"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={23}
                                    placeholder="4152 3138 0000 0000"
                                    aria-invalid={Boolean(errors.cardNumber)}
                                    className={cn(INPUT_CLASS, 'tabular-nums', errors.cardNumber && 'border-destructive')}
                                    {...register('cardNumber')}
                                />
                            </FormField>

                            <FormField id="bank" label="Banco" error={errors.bank?.message}>
                                <Input id="bank" maxLength={50} placeholder="Ej. BBVA" aria-invalid={Boolean(errors.bank)} className={cn(INPUT_CLASS, errors.bank && 'border-destructive')} {...register('bank')} />
                            </FormField>

                            <FormField id="beneficiary" label="Titular" hint="El nombre como aparece en el banco." error={errors.beneficiary?.message}>
                                <Input id="beneficiary" autoComplete="name" maxLength={100} placeholder="Ej. María Mendoza López" aria-invalid={Boolean(errors.beneficiary)} className={cn(INPUT_CLASS, errors.beneficiary && 'border-destructive')} {...register('beneficiary')} />
                            </FormField>
                        </form>
                    </div>
                ) : accounts.length === 0 ? (
                    <EmptyState title="Aún no tienes cuentas" description="Agrega la CLABE o tarjeta donde tus clientes te depositan." />
                ) : (
                    <Card className="gap-0 overflow-hidden py-0">
                        <ul className="divide-y">
                            {accounts.map((account) => {
                                const clabeDigits = digitsOnly(account.clabe)
                                const cardDigits = digitsOnly(account.cardNumber)
                                const main = clabeDigits || cardDigits
                                const what = clabeDigits ? 'CLABE' : 'Tarjeta'
                                return (
                                    <li key={account.id ?? main} className="flex min-h-16 items-center gap-1 py-2 pl-4 pr-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {account.bank} · {account.beneficiary}
                                            </p>
                                            <p className="truncate text-[15px] tabular-nums text-muted-foreground">
                                                {main ? `${what} ${formatInGroups(main)}` : 'Sin número'}
                                            </p>
                                        </div>
                                        {main && (
                                            <Button variant="ghost" size="icon" className="size-11 shrink-0 rounded-full text-muted-foreground" onClick={() => copy(main, what)} aria-label={`Copiar ${what} de ${account.bank}`}>
                                                <Copy className="size-5" aria-hidden />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11 shrink-0 rounded-full text-muted-foreground hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => handleEdit(account)}
                                            aria-label={`Editar cuenta de ${account.bank}`}
                                        >
                                            <Edit2 className="size-5" aria-hidden />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-11 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setToDelete(account)}
                                            aria-label={`Eliminar cuenta de ${account.bank}`}
                                        >
                                            <Trash2 className="size-5" aria-hidden />
                                        </Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </Card>
                )}
            </AppBottomSheet>

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(o) => !o && setToDelete(null)}
                title={`¿Eliminar la cuenta de ${toDelete?.bank ?? ''}?`}
                description="Dejará de aparecer en tus notas y contratos."
                confirmText="Sí, eliminar"
                onConfirm={() => toDelete?.id && deleteMutation.mutate(String(toDelete.id))}
                isPending={deleteMutation.isPending}
            />
        </>
    )
}