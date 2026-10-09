import os
import struct
import zlib

def extract_sequential(zip_path, target_dir):
    print(f"Starting sequential extraction of {zip_path} to {target_dir}")
    with open(zip_path, 'rb') as f:
        data = f.read()
    
    offset = 0
    total_len = len(data)
    extracted_count = 0
    
    while offset < total_len:
        # Search for PK\x03\x04 signature
        offset = data.find(b'PK\x03\x04', offset)
        if offset == -1:
            break
        
        # Check if we have enough bytes for header
        if offset + 30 > total_len:
            break
            
        header = data[offset:offset+30]
        # Unpack header fields
        sig, ver, flags, method, mod_time, mod_date, crc, comp_size, uncomp_size, name_len, extra_len = struct.unpack(
            '<IHHHHHIIIHH', header
        )
        
        name_offset = offset + 30
        extra_offset = name_offset + name_len
        data_offset = extra_offset + extra_len
        
        file_name = data[name_offset:extra_offset].decode('utf-8', errors='ignore')
        
        # Check if this looks like a valid entry
        if name_len == 0 or data_offset + comp_size > total_len:
            # Not a valid header or too large, skip signature to find next
            offset += 4
            continue
            
        comp_data = data[data_offset:data_offset+comp_size]
        
        # Prepare output path
        out_path = os.path.join(target_dir, file_name)
        
        if file_name.endswith('/'):
            os.makedirs(out_path, exist_ok=True)
        else:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            print(f"Extracting: {file_name} ({comp_size} -> {uncomp_size} bytes)")
            try:
                if method == 8: # Deflated
                    # -15 to ignore zlib headers (raw deflate)
                    uncomp_data = zlib.decompress(comp_data, -zlib.MAX_WBITS)
                elif method == 0: # Stored
                    uncomp_data = comp_data
                else:
                    print(f"Unsupported compression method {method} for {file_name}")
                    offset += 4
                    continue
                    
                with open(out_path, 'wb') as out_f:
                    out_f.write(uncomp_data)
                extracted_count += 1
            except Exception as e:
                print(f"Error decompressing {file_name}: {e}")
                
        # Advance offset past the data to search for the next signature
        offset = data_offset + comp_size

    print(f"Sequential extraction finished. Extracted {extracted_count} files to {target_dir}")

if __name__ == '__main__':
    extract_sequential('./ORBI_CLIMA_IA_V1_LOCAL_RELEASE_BACKUP/01_SOURCE_CODE_SNAPSHOT/ORBI_CLIMA_IA_SOURCE_V1_0_0_LOCAL_RELEASE.zip', '/tmp/legacy_source')
