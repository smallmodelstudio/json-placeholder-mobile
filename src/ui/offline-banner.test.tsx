import { screen } from '@testing-library/react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { renderWithProviders } from '@/test/render';

import { OfflineBanner } from './offline-banner';

const mockUseNetInfo = jest.mocked(useNetInfo);

describe('OfflineBanner', () => {
  afterEach(() => {
    mockUseNetInfo.mockReset();
  });

  it('shows a message when the device is offline', async () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: false,
    } as ReturnType<typeof useNetInfo>);

    await renderWithProviders(<OfflineBanner />);

    expect(screen.getByText(/offline/i)).toBeOnTheScreen();
  });

  it('renders nothing when the device is online', async () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: true,
    } as ReturnType<typeof useNetInfo>);

    await renderWithProviders(<OfflineBanner />);

    expect(screen.queryByText(/offline/i)).not.toBeOnTheScreen();
  });

  it('renders nothing while connectivity is still unknown', async () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: null,
    } as ReturnType<typeof useNetInfo>);

    await renderWithProviders(<OfflineBanner />);

    expect(screen.queryByText(/offline/i)).not.toBeOnTheScreen();
  });
});
