import {  useMutation } from "@tanstack/react-query";
import type {UseMutationOptions} from "@tanstack/react-query";
import type { AuthorizationError } from "@/data/api/authorization/AuthorizationError";
import type { DeviceError } from "@/data/api/device/DeviceError";
import type { DeviceData } from "@road-citizen-inspector/contracts";
import type {PatchDeviceParams} from "@/data/api/device/PatchDevice";
import {  patchDevice } from "@/data/api/device/PatchDevice";

export function useUpdateDevice(
    options?: Partial<UseMutationOptions<
        DeviceData,
        AuthorizationError | DeviceError,
        PatchDeviceParams,
        DeviceData
    >>
) {
    return useMutation({
        mutationFn: (params: PatchDeviceParams) => patchDevice(params),
        ...options
    })
}