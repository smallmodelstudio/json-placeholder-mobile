import * as Haptics from 'expo-haptics';

/** Light tap for navigating, pressing a card, retrying or refreshing. */
export function hapticTap(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Selection feedback for a segmented control or toggle changing value. */
export function hapticSelect(): void {
  void Haptics.selectionAsync();
}
