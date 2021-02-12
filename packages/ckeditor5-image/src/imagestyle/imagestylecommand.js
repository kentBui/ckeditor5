/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import { Command } from 'ckeditor5/src/core';
import { isImage, isImageInline } from '../image/utils';

/**
 * The image style command. It is used to apply different image styles.
 *
 * @extends module:core/command~Command
 */
export default class ImageStyleCommand extends Command {
	/**
	 * Creates an instance of the image style command. Each command instance is handling one style.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>} styles The styles that this command supports.
	 */
	constructor( editor, styles ) {
		super( editor );

		/**
		 * The name of the default styles for inline and block images,
		 * if it is present. If there is no default style, it defaults to `false`.
		 *
		 * @readonly
		 * @type {Boolean|String}
		 */
		this.defaultStyles = {
			imageBlock: false,
			imageInline: false
		};

		/**
		 * A style handled by this command.
		 *
		 * @readonly
		 * @member {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>} #styles
		 */
		this.styles = styles.reduce( ( styles, style ) => {
			styles[ style.name ] = style;
			return styles;
		}, {} );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled = isImage( element ) || isImageInline( element );

		if ( !element ) {
			this.value = false;
		} else if ( element.hasAttribute( 'imageStyle' ) ) {
			const attributeValue = element.getAttribute( 'imageStyle' );
			this.value = this.styles[ attributeValue ] ? attributeValue : false;
		} else {
			this.value = this._getDefaultStyle( element.name );
		}
	}

	/**
	 * Executes the command.
	 *
	 *		editor.execute( 'imageStyle', { value: 'side' } );
	 *
	 * @param {Object} options
	 * @param {String} options.value The name of the style (based on the
	 * {@link module:image/image~ImageConfig#styles `image.styles`} configuration option).
	 * @fires execute
	 */
	execute( options ) {
		const styleName = options.value;

		const model = this.editor.model;
		const imageElement = model.document.selection.getSelectedElement();

		model.change( writer => {
			// Default style means that there is no `imageStyle` attribute in the model.
			// https://github.com/ckeditor/ckeditor5-image/issues/147
			if ( this.styles[ styleName ].isDefault ) {
				writer.removeAttribute( 'imageStyle', imageElement );
			} else {
				writer.setAttribute( 'imageStyle', styleName, imageElement );
			}
		} );
	}

	_getDefaultStyle( imageType ) {
		const cachedStyle = this.defaultStyles[ imageType ];

		if ( cachedStyle ) {
			return cachedStyle;
		}

		for ( const s in this.styles ) {
			const style = this.styles[ s ];

			if ( style.isDefault && style.modelElement === imageType ) {
				return style.name;
			}
		}

		return false;
	}
}
