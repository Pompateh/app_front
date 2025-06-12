declare module 'swr' {
  import { Key, SWRConfiguration, SWRResponse } from 'swr/_internal';
  
  export function useSWR<Data = any, Error = any>(
    key: Key,
    fetcher?: ((...args: any) => Data | Promise<Data>) | null,
    config?: SWRConfiguration<Data, Error>
  ): SWRResponse<Data, Error>;
  
  export function useSWRImmutable<Data = any, Error = any>(
    key: Key,
    fetcher?: ((...args: any) => Data | Promise<Data>) | null,
    config?: SWRConfiguration<Data, Error>
  ): SWRResponse<Data, Error>;
} 