#!/bin/bash
 
# Directory to store the random files
output_dir="/tmp/test_source"
mkdir -p "$output_dir"
 
# Target total size in bytes (10 GB)
target_size=$((10 * 1024 * 1024 * 1024))
 
# Initialize current size
current_size=0
 
# Loop until the total size reaches the target
while [ "$current_size" -lt "$target_size" ]; do
    # Generate a random file size between 1KB and 1MB
    file_size=$(( (RANDOM % 1024) + 1 ))
    file_size=$(( file_size * 1024 )) # Convert KB to bytes
 
    # Generate a random file name
    file_name=$(uuidgen)
 
    # Create a random file with the specified size
    dd if=/dev/urandom of="$output_dir/$file_name" bs=$file_size count=1 2>/dev/null
 
    # Update the current total size
    current_size=$((current_size + file_size))
done
 
echo "Generated random files in '$output_dir' with a total size of approximately 10 GB."