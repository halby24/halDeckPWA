#include <MMDeviceAPI.h>
#include <Windows.h>
#include <endpointvolume.h>
#include <iostream>

#pragma comment(lib, "ole32.lib")

int main(int argc, char* argv[])
{
    if (argc != 2)
    {
        std::cerr << "Usage: SetVolume <volume_level>" << std::endl;
        return 1;
    }

    float volumeLevel = atof(argv[1]); // コマンドライン引数から音量を取得

    CoInitialize(NULL);

    IMMDeviceEnumerator* deviceEnumerator = NULL;
    IMMDevice* defaultDevice = NULL;

    CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_INPROC_SERVER, __uuidof(IMMDeviceEnumerator), (LPVOID*)&deviceEnumerator);

    deviceEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &defaultDevice);

    IAudioEndpointVolume* endpointVolume = NULL;

    defaultDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_INPROC_SERVER, NULL, (LPVOID*)&endpointVolume);

    endpointVolume->SetMasterVolumeLevelScalar(volumeLevel, NULL);

    endpointVolume->Release();
    defaultDevice->Release();
    deviceEnumerator->Release();
    CoUninitialize();

    return 0;
}
