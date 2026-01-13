<script setup lang="ts">
import type { Expense } from '~/types/expense'

const props = defineProps<{
    rows: Expense[]
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'create'): void
    (e: 'edit', row: Expense): void
    (e: 'delete', row: Expense): void
    (e: 'search', query: string): void
    (e: 'refresh'): void
}>()

const search = ref('')

const columns = [
    { id: 'description', accessorKey: 'description', header: 'Descripción' },
    { id: 'category', accessorKey: 'category', header: 'Categoría' },
    { id: 'amount', accessorKey: 'amount', header: 'Monto' },
    { id: 'date', accessorKey: 'date', header: 'Fecha' },
    { id: 'actions', header: '' },
] as const

function formatMoney(amount: string) {
    const n = Number(amount)
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}
function formatDate(iso: string) {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div class="flex gap-2 w-full sm:w-auto">
                <UInput v-model="search" placeholder="Buscar por descripción…" icon="i-lucide-search"
                    class="w-full sm:w-80" @keydown.enter="emit('search', search)" />
                <UButton variant="soft" @click="emit('search', search)">Buscar</UButton>
                <UButton variant="ghost" @click="search = ''; emit('refresh')">Limpiar</UButton>
            </div>

            <UButton icon="i-lucide-plus" @click="emit('create')">Nuevo gasto</UButton>
        </div>

        <UCard>
            <UTable :data="props.rows" :columns="columns" :loading="props.loading">
                <template #cell-amount="{ row }">
                    {{ formatMoney(row.original.amount) }}
                </template>

                <template #cell-date="{ row }">
                    {{ formatDate(row.original.date) }}
                </template>

                <template #cell-actions="{ row }">
                    <div class="flex justify-end gap-2">
                        <UButton size="xs" variant="soft" icon="i-lucide-pencil" @click="emit('edit', row.original)">
                            Editar
                        </UButton>
                        <UButton size="xs" color="red" variant="soft" icon="i-lucide-trash"
                            @click="emit('delete', row.original)">
                            Eliminar
                        </UButton>
                    </div>
                </template>
            </UTable>
        </UCard>
    </div>
</template>