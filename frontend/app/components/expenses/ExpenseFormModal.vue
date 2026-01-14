<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'
  
  const open = defineModel<boolean>('open', { default: false })
  
  const props = defineProps<{
    mode: 'create' | 'edit'
    initial?: Expense | null
    saving?: boolean
    categories?: string[] 
  }>()
  
  const emit = defineEmits<{
    (e: 'submit', payload: ExpenseCreate | ExpenseUpdate): void
  }>()
  
  const NEW_VALUE = '__new__' as const
  
  const form = reactive({
    description: '',
    amount: 0,
    category: 'other',
  })
  
  // select state
  const categorySelected = ref<string>('other') // o NEW_VALUE
  const categoryNew = ref('') // input cuando es nueva
  
  const categoryItems = computed(() => {
    const list = props.categories ?? []
    const unique = Array.from(new Set(list.map(s => s.trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    )
  
    return [
      ...unique.map(c => ({ label: c, value: c })),
      { label: '—', value: '__sep__', disabled: true },
      { label: 'Nueva…', value: NEW_VALUE },
    ]
  })
  
  function hydrateFromInitial() {
    if (props.mode === 'edit' && props.initial) {
      form.description = props.initial.description ?? ''
      form.amount = Number(props.initial.amount ?? 0)
      form.category = (props.initial.category ?? 'other').trim() || 'other'
  
      // si la categoría existe, selecciónala; si no, márcala como nueva
      const exists = (props.categories ?? []).some(c => c.toLowerCase() === form.category.toLowerCase())
      if (exists) {
        categorySelected.value = form.category
        categoryNew.value = ''
      } else {
        categorySelected.value = NEW_VALUE
        categoryNew.value = form.category
      }
    } else {
      form.description = ''
      form.amount = 0
      form.category = 'other'
      categorySelected.value = 'other'
      categoryNew.value = ''
    }
  }
  
  watch(open, (isOpen) => {
    if (!isOpen) return
    hydrateFromInitial()
  })
  
  watch(categorySelected, (val) => {
    // si cambió a categoría existente, limpia el input de nueva
    if (val !== NEW_VALUE) categoryNew.value = ''
  })
  
  function close() {
    open.value = false
  }
  
  function submit() {
    const desc = form.description.trim()
    const amount = Number(form.amount)
  
    const category =
      categorySelected.value === NEW_VALUE
        ? (categoryNew.value.trim() || 'other')
        : (categorySelected.value?.trim() || 'other')
  
    emit('submit', {
      description: desc,
      amount,
      category,
    })
  }
  </script>
  
  <template>
    <UModal v-model:open="open">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">
                {{ props.mode === 'create' ? 'Nuevo gasto' : 'Editar gasto' }}
              </div>
              <UButton icon="i-lucide-x" variant="ghost" @click="close" />
            </div>
          </template>
  
          <div class="space-y-3">
            <UFormField label="Descripción" name="description">
              <UInput v-model="form.description" />
            </UFormField>
  
            <UFormField label="Monto" name="amount">
              <UInputNumber v-model="form.amount" :step="1" />
            </UFormField>
  
            <UFormField label="Categoría" name="category">
              <div class="space-y-2">
                <USelect
                  v-model="categorySelected"
                  :items="categoryItems"
                  placeholder="Selecciona categoría…"
                />
  
                <UInput
                  v-if="categorySelected === NEW_VALUE"
                  v-model="categoryNew"
                  placeholder="Escribe la nueva categoría…"
                />
              </div>
            </UFormField>
          </div>
  
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" :disabled="props.saving" @click="close">Cancelar</UButton>
              <UButton :loading="props.saving" @click="submit">
                {{ props.mode === 'create' ? 'Guardar' : 'Actualizar' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </template>
  