declare global {
  var fileStorage: Record<string, {
    file_path: string;
    original_name: string;
    upload_time: string;
    size: number;
    check_result?: any;
    is_corrected?: boolean;
    parent_file_id?: string;
  }> | undefined;
}

export {};