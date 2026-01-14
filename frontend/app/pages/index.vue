<script setup lang="ts">
import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'
import ExpensesTable from '~/components/expenses/ExpensesTable.vue'
import ExpenseFormModal from '~/components/expenses/ExpenseFormModal.vue'
import DeleteConfirmModal from '~/components/expenses/DeleteConfirmModal.vue'
import ExpensesCharts from '~/components/expenses/ExpensesCharts.vue'
import FiltersBar, { type FiltersState } from '~/components/expenses/FiltersBar.vue'

const api = useExpensesApi()
const toast = useToast()

// data
const categories = ref<string[]>([])
const rows = ref<Expense[]>([])
const total = ref(0)
const sumAmount = ref('0')

// UI flags
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMsg = ref<string | null>(null)
const exportingCsv = ref(false)
const exportingPdf = ref(false)

// ✅ Un solo estado de filtros (compartido)
const filters = ref<FiltersState>({
    q: undefined,
    category: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    groupBy: 'month',
})

// ✅ Estado exclusivo de tabla (paginación + sort)
const tableState = ref({
    page: 1,
    pageSize: 10,
    sortBy: 'date' as 'date' | 'amount' | 'category' | 'description',
    sortDir: 'DESC' as 'ASC' | 'DESC',
})

// ✅ params que se mandan a /expenses (OJO: tu list endpoint NO filtra por fecha en backend actual)
// si luego lo agregas, ya está listo.
const listParams = computed(() => ({
    page: tableState.value.page,
    pageSize: tableState.value.pageSize,
    sortBy: tableState.value.sortBy,
    sortDir: tableState.value.sortDir,
    q: filters.value.q,
    category: filters.value.category,
}))

async function loadCategories() {
    try {
        const res = await api.categories()
        categories.value = res.data ?? []
    } catch {
        categories.value = []
    }
}

async function load() {
    loading.value = true
    errorMsg.value = null
    try {
        const res = await api.list(listParams.value)
        rows.value = res.data
        total.value = res.total
        sumAmount.value = res.sumAmount ?? '0'
    } catch (e: any) {
        errorMsg.value = e?.data?.message || e?.message || 'Error cargando gastos'
    } finally {
        loading.value = false
    }
}

// ✅ cuando cambian filtros → reset page y recarga
watch(
    filters,
    () => {
        tableState.value.page = 1
        load()
    },
    { deep: true }
)

// Eventos desde tabla (solo paginación/sort)
function onTableQueryChange(next: {
    page: number
    pageSize: number
    sortBy: 'date' | 'amount' | 'category' | 'description'
    sortDir: 'ASC' | 'DESC'
}) {
    tableState.value = { ...tableState.value, ...next }
    load()
}

// CRUD modals
const isFormOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selected = ref<Expense | null>(null)

const isDeleteOpen = ref(false)
const selectedToDelete = ref<Expense | null>(null)

function openCreate() {
    formMode.value = 'create'
    selected.value = null
    isFormOpen.value = true
}
function openEdit(row: Expense) {
    formMode.value = 'edit'
    selected.value = row
    isFormOpen.value = true
}
function openDelete(row: Expense) {
    selectedToDelete.value = row
    isDeleteOpen.value = true
}

watch(isFormOpen, (v) => {
    if (!v && formMode.value === 'create') selected.value = null
})
watch(isDeleteOpen, (v) => {
    if (!v) selectedToDelete.value = null
})

async function onSubmit(payload: ExpenseCreate | ExpenseUpdate) {
    saving.value = true
    errorMsg.value = null
    try {
        if (formMode.value === 'create') {
            await api.create(payload as ExpenseCreate)
            toast.add({ title: 'Gasto creado', description: 'Se guardó correctamente.' })
        } else {
            if (!selected.value) return
            await api.update(selected.value.id, payload as ExpenseUpdate)
            toast.add({ title: 'Gasto actualizado', description: 'Cambios guardados.' })
        }

        isFormOpen.value = false
        await load()
    } catch (e: any) {
        const msg = e?.data?.message || e?.message || 'No se pudo guardar'
        errorMsg.value = msg
        toast.add({ title: 'Error', description: String(msg), color: 'red' })
    } finally {
        saving.value = false
    }
}

async function confirmDelete() {
    if (!selectedToDelete.value) return
    deleting.value = true
    errorMsg.value = null
    try {
        await api.remove(selectedToDelete.value.id)
        toast.add({ title: 'Gasto eliminado' })
        isDeleteOpen.value = false
        selectedToDelete.value = null

        // evita quedarte en página vacía
        if (rows.value.length <= 1 && tableState.value.page > 1) {
            tableState.value.page -= 1
        }

        await load()
    } catch (e: any) {
        const msg = e?.data?.message || e?.message || 'No se pudo eliminar'
        errorMsg.value = msg
        toast.add({ title: 'Error', description: String(msg), color: 'red' })
    } finally {
        deleting.value = false
    }
}

// Exports: exporta TODO lo filtrado (sin page/pageSize)
async function downloadCsv() {
    exportingCsv.value = true
    try {
        await api.exportCsv({
            q: filters.value.q,
            category: filters.value.category,
            sortBy: tableState.value.sortBy,
            sortDir: tableState.value.sortDir,
        })
    } finally {
        exportingCsv.value = false
    }
}

async function downloadPdf() {
    exportingPdf.value = true
    try {
        await api.exportPdf({
            q: filters.value.q,
            category: filters.value.category,
            sortBy: tableState.value.sortBy,
            sortDir: tableState.value.sortDir,
        })
    } finally {
        exportingPdf.value = false
    }
}

onMounted(async () => {
    await loadCategories()
    await load()
})
</script>

<template>
    <div class="p-6 max-w-6xl mx-auto space-y-4">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold">Gastos</h1>
                <p class="text-sm opacity-70">Gestor básico de gastos</p>
            </div>

            <div class="flex gap-2">
                <UButton icon="i-lucide-file-spreadsheet" variant="soft" :loading="exportingCsv" @click="downloadCsv">
                    CSV
                </UButton>
                <UButton icon="i-lucide-file-text" variant="soft" :loading="exportingPdf" @click="downloadPdf">
                    PDF
                </UButton>
            </div>
        </div>

        <UAlert v-if="errorMsg" color="red" variant="soft" :title="String(errorMsg)" />

        <!-- ✅ Barra de filtros única -->
        <FiltersBar v-model="filters" :categories="categories" :loading="loading" @refresh="load" />

        <!-- ✅ Tabla: solo paginación / sorting -->
        <ExpensesTable :rows="rows" :total="total" :sum-amount="sumAmount" :loading="loading" :page="tableState.page"
            :page-size="tableState.pageSize" :sort-by="tableState.sortBy" :sort-dir="tableState.sortDir"
            @queryChange="onTableQueryChange" @refresh="load" @create="openCreate" @edit="openEdit"
            @delete="openDelete" />

        <!-- ✅ Charts con los mismos filtros -->
        <ExpensesCharts :params="{
            q: filters.q,
            category: filters.category,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            groupBy: filters.groupBy
        }" />

        <ExpenseFormModal v-model:open="isFormOpen" :mode="formMode" :initial="selected" :saving="saving"
            :categories="categories" @submit="onSubmit" />

        <DeleteConfirmModal v-model:open="isDeleteOpen" :loading="deleting" title="Eliminar gasto"
            message="¿Seguro que deseas eliminar este gasto?" @confirm="confirmDelete" />
    </div>
</template>