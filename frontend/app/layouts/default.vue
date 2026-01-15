<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const route = useRoute()
const auth = useAuthStore()
const { logout } = useAuth()

const items = computed<NavigationMenuItem[][]>(() => [
    [
        { label: 'Gastos', icon: 'i-lucide-receipt', to: '/', active: route.path === '/' },
        { label: 'Users', icon: 'i-lucide-users', to: '/users', active: route.path.startsWith('/users') },

    ]
])
async function onLogout() {
    await logout()
    await navigateTo('/login')
}
</script>

<template>
    <UDashboardGroup>
        <div class="flex flex-1">
            <UDashboardSidebar collapsible resizable :ui="{ footer: 'border-t border-default' }">
                <template #header="{ collapsed }">
                    <div class="flex items-center gap-2 w-full">
                        <UIcon name="i-lucide-wallet" class="size-5 text-primary"
                            :class="[collapsed ? 'mx-auto' : '']" />
                        <span v-if="!collapsed" class="font-semibold">Expense Tracker</span>
                    </div>
                </template>

                <template #default="{ collapsed }">
                    <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" class="mt-3" />

                    <UNavigationMenu :collapsed="collapsed" :items="items[1]" orientation="vertical" class="mt-auto" />
                </template>

                <template #footer="{ collapsed }">
                    <UButton icon="i-lucide-log-out" label="Salir" color="neutral" variant="ghost" class="w-full"
                        @click="onLogout" />

                </template>

            </UDashboardSidebar>

            <!-- Panel principal -->
            <UDashboardPanel id="main" class="flex-1">
                <!-- Usa slots header/body según docs -->
                <template #header>
                    <UDashboardNavbar />
                </template>

                <template #body>
                    <!-- aquí sí o sí queda tu index.vue dentro -->
                    <div class="h-full overflow-auto p-6">
                        <slot />
                    </div>
                </template>
            </UDashboardPanel>
        </div>
    </UDashboardGroup>
</template>