<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { cn } from '@/lib/cn'

defineProps<{
  checked?: boolean
  class?: string
  'aria-label'?: string
}>()

defineEmits<{ 'update:checked': [value: boolean] }>()
</script>

<template>
  <CheckboxRoot
    :checked="checked"
    :class="
      cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        $props.class,
      )
    "
    :aria-label="$props['aria-label']"
    @update:checked="(v) => $emit('update:checked', v === true)"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
