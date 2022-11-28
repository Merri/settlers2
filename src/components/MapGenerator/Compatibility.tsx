import { ChangeEventHandler, Component } from 'preact/compat'

interface Props {
	onChange: (value: string) => void;
	value: string;
}

export class Compatibility extends Component<Props> {
    handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		if (event.target instanceof HTMLInputElement) {
			this.props.onChange(event.target.value);
		}
    }

    render() {
        const returnToTheRoots = this.props.value === 'return-to-the-roots',
            romanMission = this.props.value === 'roman-mission',
            worldMission = this.props.value === 'world-mission',
            unlimitedPlay = this.props.value === 'unlimited-play',
            mapEditor = this.props.value === 'map-editor';

        return (
            <section className="generator-compatibility">
                <h2>Compatibility</h2>
                <dl>
                    <dt className="generator-compatibility__title">
                        <label>
                            <input name="compatibility" type="radio" value="return-to-the-roots"
                            checked={returnToTheRoots} onChange={this.handleChange} />
                            Return to the Roots
                        </label>
                    </dt>
                    <dd className="generator-compatibility__description">
                        <p>RttR has less limitations with map sizes, numbers of players allowed and it also doesn't bug when building roads through the edges of a map. Building harbors is not an issue. However RttR doesn't currently support all of the textures that are usable in the original game.</p>
                        <ul>
                            <li>Biggest map allowed: 1024 x 1024</li>
                            <li>Maximum number of players: 10</li>
                            <li>Seafaring: yes</li>
                            <li>Special "hidden" textures: no</li>
                            <li>Maximum land/water areas: unlimited</li>
                        </ul>
                    </dd>
                    <dt className="generator-compatibility__title">
                        <label>
                            <input name="compatibility" type="radio" value="roman-mission"
                            checked={romanMission} onChange={this.handleChange} />
                            The Settlers II Roman Mission
                        </label>
                    </dt>
                    <dd className="generator-compatibility__description">
                        <p>Roman Campaign is the least restrictive mode in the original game, however playing a map in this mode needs some extra work. RTX scripts must be self customized in order to be able to play a map.</p>
                        <ul>
                            <li>Biggest map allowed: 256 x 256</li>
                            <li>Maximum number of players: 7</li>
                            <li>Seafaring: yes</li>
                            <li>Special "hidden" textures: yes</li>
                            <li>Maximum land/water areas: 250</li>
                            <li>Human player is always Octavianus</li>
                            <li>Must customize RTX file</li>
                            <li>Longest map title: 24 characters (Greenland) or 23 characters (Wasteland and Winter World)</li>
                        </ul>
                    </dd>
                    <dt className="generator-compatibility__title">
                        <label>
                            <input name="compatibility" type="radio" value="world-mission"
                            checked={worldMission} onChange={this.handleChange} />
                            The Settlers II World Mission
                        </label>
                    </dt>
                    <dd className="generator-compatibility__description">
                        <p>World Campaign allows setting the leaders right into the map file itself. Replacing a map is easy enough as there is no scripting support.</p>
                        <ul>
                            <li>Biggest map allowed: 256 x 256</li>
                            <li>Maximum number of players: 7</li>
                            <li>Seafaring: no</li>
                            <li>Special "hidden" textures: yes</li>
                            <li>Maximum land/water areas: 250</li>
                            <li>Human player is always Octavianus</li>
                            <li>Other leaders can be set</li>
                            <li>Longest map title: 24 characters (Greenland) or 23 characters (Wasteland and Winter World)</li>
                        </ul>
                    </dd>
                    <dt className="generator-compatibility__title">
                        <label>
                            <input name="compatibility" type="radio" value="unlimited-play"
                            checked={unlimitedPlay} onChange={this.handleChange} />
                            The Settlers II Unlimited Play
                        </label>
                    </dt>
                    <dd className="generator-compatibility__description">
                        <p>Unlimited Play is the easiest mode to use in the original game: just throw SWD maps to the WORLD folder and you're ready to go.</p>
                        <ul>
                            <li>Biggest map allowed: 256 x 256</li>
                            <li>Maximum number of players: 7</li>
                            <li>Seafaring: no</li>
                            <li>Special "hidden" textures: yes</li>
                            <li>Maximum land/water areas: 250</li>
                            <li>Human player is always Octavianus</li>
                            <li>Longest map title: 19 characters</li>
                        </ul>
                    </dd>
                    <dt className="generator-compatibility__title">
                        <label>
                            <input name="compatibility" type="radio" value="map-editor"
                            checked={mapEditor} onChange={this.handleChange} />
                            The Settlers II Map Editor
                        </label>
                    </dt>
                    <dd className="generator-compatibility__description">
                        <p>This mode generates maps that have mostly the same limitations as the original map editor.</p>
                        <ul>
                            <li>Biggest map allowed: 256 x 256</li>
                            <li>Maximum number of players: 7</li>
                            <li>Seafaring: no</li>
                            <li>Special "hidden" textures: no</li>
                            <li>Maximum land/water areas: 250</li>
                            <li>Human player is always Octavianus</li>
                            <li>Edge is protected (4 nodes)</li>
                            <li>Longest map title: 17 characters</li>
                        </ul>
                    </dd>
                </dl>
            </section>
        );
    }
}
