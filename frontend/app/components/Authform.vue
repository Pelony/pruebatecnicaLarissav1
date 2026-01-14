<script setup lang="ts">
const emit = defineEmits<{
    (e: 'submit', payload: { email: string; password: string }): Promise<void> | void
}>()

const loading = ref(false)
const errorMsg = ref<string | null>(null)

const form = reactive({
    email: '',
    password: ''
})

async function onSubmit() {
    errorMsg.value = null
    loading.value = true
    try {
        // ✅ importante: esperar el submit del padre (login)
        await emit('submit', { email: form.email.trim(), password: form.password })
    } catch (e: any) {
        // backend puede venir como { message } o string
        errorMsg.value =
            e?.data?.message ||
            e?.message ||
            'No se pudo iniciar sesión'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UForm class="space-y-4" @submit.prevent="onSubmit">
        <UFormGroup label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="admin@demo.com" autocomplete="email" />
        </UFormGroup>

        <UFormGroup label="Contraseña" name="password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </UFormGroup>

        <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />

        <UButton type="submit" block :loading="loading">
            Entrar
        </UButton>
    </UForm>
</template>