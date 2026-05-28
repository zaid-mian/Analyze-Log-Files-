"""
MapReduce Engine — Portfolio Edition
Pure Python parallel log processing with benchmarks & metrics.
Pipeline: Split -> Map -> Shuffle -> Reduce
"""

import re
import time
from multiprocessing import Pool, cpu_count
from collections import defaultdict


# ─── SPLIT ───────────────────────────────────────────────────────────────────
def split_file(filepath, num_chunks=None):
    if num_chunks is None:
        num_chunks = min(cpu_count(), 8)
    with open(filepath, "r", errors="ignore") as f:
        lines = f.readlines()
    if not lines:
        return [], 0
    chunk_size = max(1, len(lines) // num_chunks)
    chunks = [lines[i:i + chunk_size] for i in range(0, len(lines), chunk_size)]
    return chunks, len(lines)


# ─── MAP ─────────────────────────────────────────────────────────────────────
def map_chunk(chunk):
    results = []
    for line in chunk:
        # HTTP status codes
        status_match = re.search(r'"[A-Z]+\s+\S+\s+HTTP/[\d.]+"\s+(\d{3})', line)
        if not status_match:
            status_match = re.search(r'"\s*(\d{3})\s+', line)
        if status_match:
            code = status_match.group(1)
            if code in {"200","201","204","301","302","400","401","403","404","429","500","502","503","504"}:
                results.append((f"HTTP_{code}", 1))

        # Hour-based traffic
        hour_match = re.search(r"\[\d{2}/\w+/\d{4}:(\d{2}):", line)
        if hour_match:
            results.append((f"Hour_{int(hour_match.group(1)):02d}", 1))

        # IP addresses
        ip_match = re.match(r"^(\d{1,3}(?:\.\d{1,3}){3})", line)
        if ip_match:
            results.append((f"IP_{ip_match.group(1)}", 1))

        # HTTP methods
        method_match = re.search(r'"(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s', line)
        if method_match:
            results.append((f"METHOD_{method_match.group(1)}", 1))

        # Response sizes
        size_match = re.search(r'"\s+\d{3}\s+(\d+)', line)
        if size_match:
            size = int(size_match.group(1))
            if size > 0:
                if size < 1024:
                    bucket = "SIZE_small"
                elif size < 10240:
                    bucket = "SIZE_medium"
                else:
                    bucket = "SIZE_large"
                results.append((bucket, 1))

    return results


# ─── SHUFFLE ─────────────────────────────────────────────────────────────────
def shuffle(mapped_results):
    grouped = defaultdict(list)
    for pairs in mapped_results:
        for key, val in pairs:
            grouped[key].append(val)
    return dict(sorted(grouped.items()))


# ─── REDUCE ──────────────────────────────────────────────────────────────────
def reduce_groups(grouped):
    return {key: sum(vals) for key, vals in grouped.items()}


# ─── FULL PIPELINE ────────────────────────────────────────────────────────────
def run_mapreduce(filepath):
    t_start = time.time()

    # SPLIT
    t0 = time.time()
    chunks, total_lines = split_file(filepath)
    t_split = round(time.time() - t0, 4)

    if not chunks:
        return {}, {}

    # MAP (parallel)
    t0 = time.time()
    num_workers = min(len(chunks), cpu_count())
    with Pool(processes=num_workers) as pool:
        mapped = pool.map(map_chunk, chunks)
    t_map = round(time.time() - t0, 4)

    # SHUFFLE
    t0 = time.time()
    shuffled = shuffle(mapped)
    t_shuffle = round(time.time() - t0, 4)

    # REDUCE
    t0 = time.time()
    final = reduce_groups(shuffled)
    t_reduce = round(time.time() - t0, 4)

    t_total = round(time.time() - t_start, 4)
    lines_per_sec = round(total_lines / t_total, 1) if t_total > 0 else 0

    benchmarks = {
        "total_lines": total_lines,
        "num_chunks": len(chunks),
        "num_workers": num_workers,
        "t_split": t_split,
        "t_map": t_map,
        "t_shuffle": t_shuffle,
        "t_reduce": t_reduce,
        "t_total": t_total,
        "lines_per_sec": lines_per_sec,
        "unique_keys": len(final),
    }

    return final, benchmarks
