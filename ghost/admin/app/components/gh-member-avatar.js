import Component from '@glimmer/component';
import {htmlSafe} from '@ember/template';

const stringToHslColor = function (str, saturation, lightness) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var h = hash % 360;
    return 'hsl(' + h + ', ' + saturation + '%, ' + lightness + '%)';
};

export default class GhMemberAvatarComponent extends Component {
    get memberName() {
        let {member} = this.args;

        if (member && typeof member.get === 'function') {
            return member.get('name') || member.get('email') || 'NM';
        } else {
            return member?.name || member?.email || 'NM';
        }
    }

    get avatarImage() {
        let {member} = this.args;

        // to cover both ways avatar image is returned depending on where member data comes from

        if (member && typeof member.get === 'function') {
            return member.get('avatar_image') || member.get('avatarImage') || 'NM';
        } else {
            return member?.avatar_image || member?.avatarImage || null;
        }
    }

    get backgroundStyle() {
        let color = stringToHslColor(this.memberName, 75, 55);
        return htmlSafe(`background-color: ${color}`);
    }

    get initials() {
        if (this.memberName === 'NM') {
            return 'NM';
        }

        let names = this.memberName.split(' ');
        let intials = names.length > 1 ? [names[0][0], names[names.length - 1][0]] : [names[0][0]];
        return intials.join('').toUpperCase();
    }
}
