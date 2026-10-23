import {defineConfig} from 'vitest/config';
// Seeded multi-season and statistical checks need a predictable CPU share on laptops.
export default defineConfig({test:{maxWorkers:2,testTimeout:15000}});
