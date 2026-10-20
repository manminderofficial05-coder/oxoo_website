'use client';
import { installDemoApi } from './install';

// Installed at module-evaluation time so it is in place before any page effect calls fetch().
installDemoApi();

export function DemoBootstrap() { return null; }
