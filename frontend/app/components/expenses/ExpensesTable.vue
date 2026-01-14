<script setup lang="ts">
import { computed, h, resolveComponent, ref, watch } from 'vue'
import type { Expense } from '~/types/expense'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'

type QueryState = {
    page: number
    pageSize: number
    sortBy?: 'date' | 'amount' | 'category' | 'description'
    sortDir?: 'ASC' | 'DESC'
}

const props = defineProps<{
    rows: Expense[]
    total: number
    sumAmount?: string
    loading?: boolean

    // estado controlado desde el padre (opcional, pero recomendado)
    page?: number // 1-based
    pageSize?: number
    sortBy?: 'date' | 'amount' | 'category' | 'description'
    sortDir?: 'ASC' | 'DESC'
}>()

const emit = defineEmits<{
    (e: 'create'): void
    (e: 'edit', row: Expense): void
    (e: 'delete', row: Expense): void
    (e: 'refresh'): void
    (e: 'queryChange', q: QueryState): void
}>()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')

function formatMoney(amount: string) {
    const n = Number(amount)
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}
function formatDate(iso: string) {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

const columns = computed<ColumnDef<Expense>[]>(() => [
    { accessorKey: 'description', header: 'Descripción' },
    {
        accessorKey: 'category',
        header: 'Categoría',
        cell: ({ row }) => {
            const value = String(row.original.category ?? '')
            return h(UBadge, { variant: 'subtle', class: 'capitalize' }, () => value || 'other')
        }
    },
    {
        accessorKey: 'amount',
        header: 'Monto',
        cell: ({ row }) => formatMoney(String(row.original.amount)),
        meta: { class: { th: 'text-right', td: 'text-right font-medium' } }
    },
    {
        accessorKey: 'date',
        header: 'Fecha',
        cell: ({ row }) => formatDate(String(row.original.date))
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const exp = row.original
            return h('div', { class: 'flex justify-end gap-2' }, [
                h(
                    UButton as any,
                    { size: 'xs', variant: 'soft', icon: 'i-lucide-pencil', onClick: () => emit('edit', exp) },
                    () => 'Editar'
                ),
                h(
                    UButton as any,
                    { size: 'xs', color: 'error', variant: 'soft', icon: 'i-lucide-trash', onClick: () => emit('delete', exp) },
                    () => 'Eliminar'
                )
            ])
        },
        meta: { class: { th: 'w-[1%]', td: 'whitespace-nowrap text-right' } }
    }
])

/**
 * Estado interno (con fallback al estado del padre).
 * Esto evita que se "reinicie" si el padre aún no controla page/pageSize/sort,
 * pero también se sincroniza si el padre sí lo controla.
 */
const pageIndex = ref(Math.max(0, (props.page ?? 1) - 1)) // 0-based
const size = ref(props.pageSize ?? 10)

// SortingState de TanStack (para Nuxt UI v4)
const sorting = ref<SortingState>(() => {
    const sb = props.sortBy ?? 'date'
    const sd = props.sortDir ?? 'DESC'
    return [{ id: sb, desc: sd === 'DESC' }]
})

watch(
    () => props.page,
    (v) => {
        if (!v) return
        pageIndex.value = Math.max(0, v - 1)
    }
)

watch(
    () => props.pageSize,
    (v) => {
        if (!v) return
        size.value = v
    }
)

watch(
    () => [props.sortBy, props.sortDir] as const,
    ([sb, sd]) => {
        if (!sb || !sd) return
        sorting.value = [{ id: sb, desc: sd === 'DESC' }]
    }
)

const pageCount = computed(() => Math.max(1, Math.ceil((props.total || 0) / size.value)))

const page = computed({
    get: () => pageIndex.value + 1,
    set: (v: number) => {
        const next = Math.min(Math.max(1, v || 1), pageCount.value)
        pageIndex.value = next - 1
    }
})

const canPrev = computed(() => pageIndex.value > 0)
const canNext = computed(() => pageIndex.value + 1 < pageCount.value)

function sortToApi(s: SortingState) {
    if (!s.length) return { sortBy: 'date' as const, sortDir: 'DESC' as const }
    const first = s[0]
    return {
        sortBy: first.id as QueryState['sortBy'],
        sortDir: first.desc ? 'DESC' : 'ASC'
    }
}

function emitQueryChange() {
    const { sortBy, sortDir } = sortToApi(sorting.value)
    emit('queryChange', {
        page: page.value,
        pageSize: size.value,
        sortBy,
        sortDir
    })
}

// Emitir cuando cambia paginación o sorting
watch([pageIndex, size], () => emitQueryChange())
watch(
    sorting,
    () => {
        pageIndex.value = 0 // reset a la primera página cuando cambias sort
        emitQueryChange()
    },
    { deep: true }
)
</script>

<template>
    <div class="space-y-3">
        <!-- Header / summary -->
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <UBadge variant="subtle">{{ total }} gastos</UBadge>

                <UBadge v-if="sumAmount" color="info" variant="soft">
                    Total: {{ formatMoney(sumAmount) }}
                </UBadge>
            </div>

            <div class="flex items-center gap-2">
                <UButton variant="soft" icon="i-lucide-refresh-cw" :loading="loading" @click="emit('refresh')">
                    Recargar
                </UButton>
                <UButton icon="i-lucide-plus" @click="emit('create')">Nuevo gasto</UButton>
            </div>
        </div>

        <!-- Table -->
        <UCard>
            <UTable :data="rows" :columns="columns" :loading="loading" v-model:sorting="sorting" />
        </UCard>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="text-sm opacity-70">
                Mostrando
                {{ total ? (pageIndex * size + 1) : 0 }}
                -
                {{ Math.min(total, (pageIndex + 1) * size) }}
                de {{ total }}
            </div>

            <div class="flex items-center gap-2 justify-end">
                <USelectMenu v-model="size" :items="[5, 10, 20, 50].map(n => ({ label: `${n} / pág`, value: n }))"
                    value-key="value" label-key="label" class="w-28" />

                <UButton variant="ghost" icon="i-lucide-chevron-left" :disabled="!canPrev" @click="pageIndex--">
                    Prev
                </UButton>

                <UInput :model-value="page" type="number" class="w-20"
                    @update:model-value="(v: any) => (page = Number(v || 1))" />

                <span class="text-sm opacity-70">/ {{ pageCount }}</span>

                <UButton variant="ghost" icon="i-lucide-chevron-right" :disabled="!canNext" @click="pageIndex++">
                    Next
                </UButton>
            </div>
        </div>
    </div>
</template>