<script setup lang="ts">
import { computed, h, resolveComponent, ref, watch, onMounted } from 'vue'
import type { Expense } from '~/types/expense'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'

type QueryState = {
    page: number
    pageSize: number
    q?: string
    category?: string
    sortBy?: 'date' | 'amount' | 'category' | 'description'
    sortDir?: 'ASC' | 'DESC'
}

const props = defineProps<{
    rows: Expense[]
    total: number
    sumAmount?: string
    loading?: boolean
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

// UI state
const q = ref('')
const category = ref('')
const sorting = ref<SortingState>([])
const pageIndex = ref(0)
const pageSize = ref(10)

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

const pageCount = computed(() => Math.max(1, Math.ceil((props.total || 0) / pageSize.value)))
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
        page: pageIndex.value + 1,
        pageSize: pageSize.value,
        q: q.value.trim() || undefined,
        category: category.value.trim() || undefined,
        sortBy,
        sortDir
    })
}

watch([q, category], () => {
    pageIndex.value = 0
    emitQueryChange()
})

watch([pageIndex, pageSize], () => {
    emitQueryChange()
})
watch(sorting, () => {
    pageIndex.value = 0
    emitQueryChange()
}, { deep: true })

onMounted(() => emitQueryChange())

function clearFilters() {
    q.value = ''
    category.value = ''
    pageIndex.value = 0
    emitQueryChange()
}
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div class="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
                <UInput v-model="q" placeholder="Buscar…" icon="i-lucide-search" class="w-full sm:w-96" />
                <UInput v-model="category" placeholder="Categoría…" icon="i-lucide-filter" class="w-full sm:w-64" />
                <UButton variant="ghost" @click="clearFilters">Limpiar</UButton>
            </div>

            <div class="flex gap-2 justify-end">
                <UButton variant="soft" icon="i-lucide-refresh-cw" :loading="loading" @click="emit('refresh')">
                    Recargar
                </UButton>
                <UButton icon="i-lucide-plus" @click="emit('create')">Nuevo gasto</UButton>
            </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2">
                <UBadge variant="subtle">{{ props.total }} gastos</UBadge>

                <UBadge v-if="props.sumAmount" color="info" variant="soft">
                    Total: {{ formatMoney(props.sumAmount) }}
                </UBadge>
            </div>

            <div class="text-xs opacity-70">
                Página {{ page }} / {{ pageCount }}
            </div>
        </div>
        <UCard>
            <!-- ✅ Nuxt UI v4: usa data + columns -->
            <UTable :data="props.rows" :columns="columns" :loading="loading" v-model:sorting="sorting" />
        </UCard>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="text-sm opacity-70">
                Mostrando
                {{ props.total ? (pageIndex * pageSize + 1) : 0 }}
                -
                {{ Math.min(props.total, (pageIndex + 1) * pageSize) }}
                de {{ props.total }}
            </div>

            <div class="flex items-center gap-2 justify-end">
                <USelect v-model="pageSize" :options="[5, 10, 20, 50].map(n => ({ label: `${n} / pág`, value: n }))"
                    class="w-28" />

                <UButton variant="ghost" icon="i-lucide-chevron-left" :disabled="!canPrev" @click="pageIndex--">
                    Prev
                </UButton>

                <UInput :model-value="page" type="number" class="w-20"
                    @update:model-value="(v: any) => page = Number(v || 1)" />

                <span class="text-sm opacity-70">/ {{ pageCount }}</span>

                <UButton variant="ghost" icon="i-lucide-chevron-right" :disabled="!canNext" @click="pageIndex++">
                    Next
                </UButton>
            </div>
        </div>
    </div>
</template>