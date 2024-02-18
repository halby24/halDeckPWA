#pragma once

#include <ObjectArray.h>

class IApplicationView {
    virtual HRESULT SetFocus();
	virtual HRESULT SwitchTo();
	virtual HRESULT TryInvokeBack(IntPtr /* IAsyncCallback* */ callback);
	virtual HRESULT GetThumbnailWindow(out IntPtr hwnd);
	virtual HRESULT GetMonitor(out IntPtr /* IImmersiveMonitor */ immersiveMonitor);
	virtual HRESULT GetVisibility(out int visibility);
	virtual HRESULT SetCloak(APPLICATION_VIEW_CLOAK_TYPE cloakType, int unknown);
	virtual HRESULT GetPosition(ref Guid guid /* GUID for IApplicationViewPosition */, out IntPtr /* IApplicationViewPosition** */ position);
	virtual HRESULT SetPosition(ref IntPtr /* IApplicationViewPosition* */ position);
	virtual HRESULT InsertAfterWindow(IntPtr hwnd);
	virtual HRESULT GetExtendedFramePosition(out Rect rect);
	virtual HRESULT GetAppUserModelId([MarshalAs(UnmanagedType.LPWStr)] out string id);
	virtual HRESULT SetAppUserModelId(string id);
	virtual HRESULT IsEqualByAppUserModelId(string id, out int result);
	virtual HRESULT GetViewState(out uint state);
	virtual HRESULT SetViewState(uint state);
	virtual HRESULT GetNeediness(out int neediness);
	virtual HRESULT GetLastActivationTimestamp(out ulong timestamp);
	virtual HRESULT SetLastActivationTimestamp(ulong timestamp);
	virtual HRESULT GetVirtualDesktopId(out Guid guid);
	virtual HRESULT SetVirtualDesktopId(ref Guid guid);
	virtual HRESULT GetShowInSwitchers(out int flag);
	virtual HRESULT SetShowInSwitchers(int flag);
	virtual HRESULT GetScaleFactor(out int factor);
	virtual HRESULT CanReceiveInput(out bool canReceiveInput);
	virtual HRESULT GetCompatibilityPolicyType(out APPLICATION_VIEW_COMPATIBILITY_POLICY flags);
	virtual HRESULT SetCompatibilityPolicyType(APPLICATION_VIEW_COMPATIBILITY_POLICY flags);
	virtual HRESULT GetSizeConstraints(IntPtr /* IImmersiveMonitor* */ monitor, out Size size1, out Size size2);
	virtual HRESULT GetSizeConstraintsForDpi(uint uint1, out Size size1, out Size size2);
	virtual HRESULT SetSizeConstraintsForDpi(unsigned int* uint1, ref Size size1, ref Size size2);
	virtual HRESULT OnMinSizePreferencesUpdated(HWND* hwnd);
	virtual HRESULT ApplyOperation(int* operation);
	virtual HRESULT IsTray(bool* isTray);
	virtual HRESULT IsInHighZOrderBand(bool* isInHighZOrderBand);
	virtual HRESULT IsSplashScreenPresented(bool* isSplashScreenPresented);
	virtual HRESULT Flash();
	virtual HRESULT GetRootSwitchableOwner(IApplicationView* rootSwitchableOwner);
	virtual HRESULT EnumerateOwnershipTree(IObjectArray* ownershipTree);
	virtual HRESULT GetEnterpriseId(char* enterpriseId);
	virtual HRESULT IsMirrored(bool* isMirrored);
	virtual HRESULT Unknown1(int* unknown);
	virtual HRESULT Unknown2(int* unknown);
	virtual HRESULT Unknown3(int* unknown);
	virtual HRESULT Unknown4(int* unknown);
	virtual HRESULT Unknown5(int* unknown);
	virtual HRESULT Unknown6(int unknown);
	virtual HRESULT Unknown7();
	virtual HRESULT Unknown8(int* unknown);
	virtual HRESULT Unknown9(int unknown);
	virtual HRESULT Unknown10(int unknownX, int unknownY);
	virtual HRESULT Unknown11(int unknown);
	virtual HRESULT Unknown12(SIZE* size1);
};

class IVirtualDesktop : public IUnknown
{
  public:
    virtual HRESULT IsViewVisible(IApplicationView view) = 0;
    virtual GUID GetId() = 0;
};

class IVirtualDesktopManagerInternal : public IUnknown
{
  public:
    virtual int GetCount() = 0;
	virtual void MoveViewToDesktop(IApplicationView view, IVirtualDesktop desktop) = 0;
	virtual HRESULT CanViewMoveDesktops(IApplicationView view) = 0;
	virtual IVirtualDesktop GetCurrentDesktop() = 0;
	virtual void GetDesktops(IObjectArray desktops) = 0;
	virtual int GetAdjacentDesktop(IVirtualDesktop from, int direction, IVirtualDesktop desktop) = 0;
	virtual void SwitchDesktop(IVirtualDesktop desktop) = 0;
	virtual IVirtualDesktop CreateDesktop() = 0;
	virtual void RemoveDesktop(IVirtualDesktop desktop, IVirtualDesktop fallback) = 0;
	virtual IVirtualDesktop FindDesktop(GUID desktopid) = 0;
};