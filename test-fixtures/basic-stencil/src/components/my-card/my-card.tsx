import { Component, Prop, h } from '@stencil/core';

/**
 * A card component with header, content, and footer slots
 */
@Component({
  tag: 'my-card',
  styleUrl: 'my-card.css',
  shadow: true,
})
export class MyCard {
  /**
   * Card title
   */
  @Prop() title?: string;

  /**
   * Card elevation (box-shadow depth)
   */
  @Prop() elevation: 0 | 1 | 2 | 3 = 1;

  /**
   * Whether the card is interactive (adds hover effect)
   */
  @Prop() interactive: boolean = false;

  render() {
    return (
      <div
        class={{
          'card': true,
          [`card--elevation-${this.elevation}`]: true,
          'card--interactive': this.interactive,
        }}
      >
        {this.title && (
          <div class="card__header">
            <h3 class="card__title">{this.title}</h3>
            <slot name="header-actions" />
          </div>
        )}
        
        <div class="card__content">
          <slot />
        </div>
        
        <div class="card__footer">
          <slot name="footer" />
        </div>
      </div>
    );
  }
}
