/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';
import { TextEncoder, TextDecoder } from 'node:util';

// Polyfill TextEncoder/TextDecoder for Node.js test environment
// @ts-ignore - ignore type mismatch between Node.js and browser globals
global.TextEncoder = TextEncoder;
// @ts-ignore - ignore type mismatch between Node.js and browser globals
global.TextDecoder = TextDecoder;
