import * as dotenv from 'dotenv'; // or use require('dotenv').config() if using CommonJS
import { Redis } from '@upstash/redis';

dotenv.config({ path: '.redis.env' });

const redis = Redis.fromEnv();

await redis.set("foo", "bar");
const value = await redis.get("foo");
console.log(value);
