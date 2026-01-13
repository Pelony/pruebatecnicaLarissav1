<script setup lang="ts">
  const open = defineModel<boolean>('open', { default: false })
  
  const props = defineProps<{
    loading?: boolean
    title?: string
    message?: string
  }>()
  
  const emit = defineEmits<{
    (e: 'confirm'): void
  }>()
  
  function close() {
    open.value = false
  }
  </script>
  
  <template>
    <UModal v-model:open="open">
      <template #content>
        <UCard>
          <template #header>
            <div class="font-semibold">{{ props.title ?? 'Eliminar gasto' }}</div>
          </template>
  
          <p class="text-sm opacity-70">
            {{ props.message ?? '¿Seguro que deseas eliminar este gasto?' }}
          </p>
  
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" :disabled="props.loading" @click="close">Cancelar</UButton>
              <UButton color="error" :loading="props.loading" @click="emit('confirm')">Eliminar</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </template>
  