<script setup lang="ts">
  import type { Expense, ExpenseCreate, ExpenseUpdate } from '~/types/expense'
  
  const open = defineModel<boolean>('open', { default: false })
  
  const props = defineProps<{
    mode: 'create' | 'edit'
    initial?: Expense | null
    saving?: boolean
  }>()
  
  const emit = defineEmits<{
    (e: 'submit', payload: ExpenseCreate | ExpenseUpdate): void
  }>()
  
  const form = reactive({
    description: '',
    amount: 0,
    category: 'other',
  })
  
  watch(open, (isOpen) => {
    if (!isOpen) return
  
    if (props.mode === 'edit' && props.initial) {
      form.description = props.initial.description ?? ''
      form.amount = Number(props.initial.amount ?? 0)
      form.category = props.initial.category ?? 'other'
    } else {
      form.description = ''
      form.amount = 0
      form.category = 'other'
    }
  })
  
  function close() {
    open.value = false
  }
  
  function submit() {
    emit('submit', {
      description: form.description,
      amount: form.amount,
      category: form.category,
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
              <UInputNumber v-model="form.amount" :step="0.01" />
            </UFormField>
  
            <UFormField label="Categoría" name="category">
              <UInput v-model="form.category" />
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
  