<script setup lang="ts">
definePageMeta({ layout: 'auth' })
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { login } = useAuth()

watchEffect(() => {
    if (auth.isLoggedIn) router.replace('/')
})

async function handleSubmit(payload: { email: string; password: string }) {
    await login(payload.email, payload.password)
    const next = typeof route.query.next === 'string' ? route.query.next : '/'
    await router.replace(next)
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="w-full max-w-md">
            <UCard>
                <template #header>
                    <div class="space-y-1">
                        <h1 class="text-xl font-semibold">Iniciar sesión</h1>
                        <p class="text-sm text-muted">
                            Accede para ver tus gastos.
                        </p>
                    </div>
                </template>

                <!-- ✅ OJO: AuthForm (no Authform) -->
                <Authform @submit="handleSubmit" />
            </UCard>
        </div>
    </div>
</template>