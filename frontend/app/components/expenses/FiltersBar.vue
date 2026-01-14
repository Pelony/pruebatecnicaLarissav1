<script setup lang="ts">
import { computed } from 'vue'

export type FiltersState = {
    q?: string
    category?: string
    dateFrom?: string // YYYY-MM-DD
    dateTo?: string   // YYYY-MM-DD
    groupBy: 'day' | 'month'
}

const props = defineProps<{
    categories: string[]
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'refresh'): void
}>()

const model = defineModel<FiltersState>({
    default: () => ({
        q: undefined,
        category: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        groupBy: 'month',
    }),
})

// ✅ Nunca uses value="" en Selects
const ALL = '__all__'

const categoryItems = computed(() => {
    const base = [{ label: 'Todas las categorías', value: ALL }]
    const cats = (props.categories ?? [])
        .map(c => String(c || '').trim())
        .filter(Boolean)
        .map(c => ({ label: c, value: c }))
    return [...base, ...cats]
})

const categoryProxy = computed<string>({
    get: () => model.value.category ?? ALL,
    set: (v) => { model.value.category = v === ALL ? undefined : v },
})

const groupByItems = [
    { label: 'Por mes', value: 'month' },
    { label: 'Por día', value: 'day' },
] as const

const hasFilters = computed(() => {
    const m = model.value
    return Boolean(
        (m.q && m.q.trim()) ||
        m.category ||
        m.dateFrom ||
        m.dateTo ||
        (m.groupBy && m.groupBy !== 'month')
    )
})

const chips = computed(() => {
    const m = model.value
    const out: { key: string; label: string }[] = []
    if (m.q?.trim()) out.push({ key: 'q', label: `Buscar: ${m.q.trim()}` })
    if (m.category) out.push({ key: 'category', label: `Categoría: ${m.category}` })
    if (m.dateFrom) out.push({ key: 'dateFrom', label: `Desde: ${m.dateFrom}` })
    if (m.dateTo) out.push({ key: 'dateTo', label: `Hasta: ${m.dateTo}` })
    if (m.groupBy) out.push({ key: 'groupBy', label: `Agrupar: ${m.groupBy === 'day' ? 'Día' : 'Mes'}` })
    return out
})

function apply() {
    emit('refresh')
}

function clear() {
    model.value = {
        q: undefined,
        category: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        groupBy: 'month',
    }
    emit('refresh')
}

function removeChip(key: string) {
    if (key === 'q') model.value.q = undefined
    if (key === 'category') model.value.category = undefined
    if (key === 'dateFrom') model.value.dateFrom = undefined
    if (key === 'dateTo') model.value.dateTo = undefined
    if (key === 'groupBy') model.value.groupBy = 'month'
    emit('refresh')
}
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-2">
                    <div class="font-semibold">Filtros</div>
                    <UBadge v-if="hasFilters" variant="soft" color="primary">
                        Activos: {{ chips.length }}
                    </UBadge>
                </div>

                <div class="flex items-center gap-2 justify-end">
                    <UButton variant="ghost" icon="i-lucide-rotate-ccw" :disabled="!hasFilters || loading"
                        @click="clear">
                        Limpiar
                    </UButton>

                    <UButton variant="soft" icon="i-lucide-filter" :loading="loading" @click="apply">
                        Aplicar
                    </UButton>
                </div>
            </div>
        </template>

        <!-- ✅ Layout más limpio -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <!-- Buscar -->
            <div class="md:col-span-5">
                <UFormField label="Buscar" help="Busca por descripción o categoría">
                    <UInput v-model="model.q" placeholder="Ej. uber, gasolina, renta…" icon="i-lucide-search"
                        @keyup.enter="apply" />
                </UFormField>
            </div>

            <!-- Categoría -->
            <div class="md:col-span-4">
                <UFormField label="Categoría">
                    <USelectMenu v-model="categoryProxy" :items="categoryItems" value-key="value" label-key="label"
                        :disabled="loading" />
                </UFormField>
            </div>

            <!-- Agrupar -->
            <div class="md:col-span-3">
                <UFormField label="Agrupar reportes">
                    <USelectMenu v-model="model.groupBy" :items="groupByItems" value-key="value" label-key="label"
                        :disabled="loading" />
                </UFormField>
            </div>

            <!-- Rango fechas (alineado bonito) -->
            <div class="md:col-span-3">
                <UFormField label="Desde">
                    <UInput v-model="model.dateFrom" type="date" :disabled="loading" />
                </UFormField>
            </div>

            <div class="md:col-span-3">
                <UFormField label="Hasta">
                    <UInput v-model="model.dateTo" type="date" :disabled="loading" />
                </UFormField>
            </div>

            <!-- Botón rápido (opcional) -->
            <div class="md:col-span-6 flex items-end justify-end">
                <UButton class="w-full md:w-auto" variant="soft" icon="i-lucide-refresh-cw" :loading="loading"
                    @click="apply">
                    Refrescar
                </UButton>
            </div>
        </div>

        <!-- Chips -->
        <div v-if="hasFilters" class="mt-4">
            <UDivider class="mb-3" />
            <div class="flex flex-wrap gap-2">
                <UBadge v-for="c in chips" :key="c.key" variant="soft" color="info" class="cursor-pointer select-none"
                    @click="removeChip(c.key)" title="Click para quitar">
                    {{ c.label }}
                    <span class="ml-2 opacity-70">×</span>
                </UBadge>
            </div>
            <div class="text-xs opacity-60 mt-2">
                Tip: quita un filtro dando click en su “chip”.
            </div>
        </div>
    </UCard>
</template>