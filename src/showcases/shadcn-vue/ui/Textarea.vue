<script setup lang="ts">
import { cn } from '@/lib/cn'

defineProps<{
  modelValue?: string
  placeholder?: string
  id?: string
  rows?: number
  class?: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :id="id"
    :rows="rows ?? 3"
    :value="modelValue"
    :placeholder="placeholder"
    :class="
      cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
